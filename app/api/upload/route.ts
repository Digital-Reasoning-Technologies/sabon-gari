import { NextRequest, NextResponse } from 'next/server';
import { assertCloudinaryConfigured, cloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';
import { getSiteConfig } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function uploadFileToCloudinary(file: File, folder: string) {
  // Validate file before processing
  if (!file || file.size === 0) {
    throw new Error('File is empty or invalid');
  }

  // Check file size (Cloudinary free plan limit is typically 10MB, paid plans support more)
  const maxSize = 20 * 1024 * 1024; // 20MB default limit
  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`);
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error(`Invalid file type: ${file.type}. Only image files are allowed.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await new Promise<any>((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // Add additional options for better error handling
          timeout: 60000, // 60 second timeout
        },
        (error: unknown, result: any) => {
          if (error) {
            // Provide more specific error messages
            if (typeof error === 'object' && error !== null && 'message' in error) {
              const errorMessage = (error as { message: string }).message;
              if (errorMessage.includes('Invalid API Key')) {
                return reject(new Error('Cloudinary authentication failed. Please check your API credentials.'));
              }
              if (errorMessage.includes('File size too large')) {
                return reject(new Error('File size exceeds Cloudinary limits. Please use a smaller file.'));
              }
              if (errorMessage.includes('Invalid image file')) {
                return reject(new Error('Invalid image format. Please upload a valid image file.'));
              }
              return reject(new Error(`Cloudinary upload failed: ${errorMessage}`));
            }
            return reject(new Error(`Cloudinary upload failed: ${String(error)}`));
          }
          
          if (!result) {
            return reject(new Error('Cloudinary upload returned no result'));
          }
          
          resolve(result);
        }
      );

      // Properly write buffer to stream according to Cloudinary best practices
      uploadStream.write(buffer);
      uploadStream.end();
    } catch (streamError: any) {
      reject(new Error(`Failed to create upload stream: ${streamError?.message || String(streamError)}`));
    }
  });

  // Validate upload result
  if (!uploadResult.secure_url) {
    throw new Error('Upload succeeded but no URL was returned from Cloudinary');
  }

  return {
    url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
    width: uploadResult.width,
    height: uploadResult.height,
    format: uploadResult.format,
    bytes: uploadResult.bytes,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration first
    try {
      assertCloudinaryConfigured();
    } catch (configError: any) {
      console.error('Cloudinary configuration error:', configError);
      return NextResponse.json(
        {
          ok: false,
          message: 'Cloudinary is not configured',
          error: configError?.message || 'Please configure Cloudinary credentials in your environment variables.',
        },
        { status: 500 }
      );
    }

    // Authenticate user
    try {
      await requireAuth(request, ['admin', 'superadmin']);
    } catch (authError: any) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        {
          ok: false,
          message: 'Authentication required',
          error: authError?.message || 'You must be logged in as an admin to upload files.',
        },
        { status: 401 }
      );
    }

    // Parse FormData - Next.js will handle the Content-Type automatically
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError: any) {
      const contentType = request.headers.get('content-type') || 'not set';
      console.error('FormData parse error:', parseError);
      console.error('Content-Type:', contentType);
      console.error('Request method:', request.method);
      console.error('Error details:', {
        message: parseError?.message,
        stack: parseError?.stack,
        name: parseError?.name,
      });
      
      return NextResponse.json(
        { 
          ok: false, 
          message: 'Failed to parse body as FormData.',
          error: parseError?.message || String(parseError),
          details: {
            contentType,
            hint: 'Make sure the request is sent with multipart/form-data and includes file data.'
          }
        },
        { status: 400 }
      );
    }

    const files = formData.getAll('file');
    const config = getSiteConfig();
    const defaultFolder = config.upload?.defaultFolder ?? 'kudan/news';
    const folder = (formData.get('folder') as string | null) ?? defaultFolder;

    // Validate files
    const validFiles = files.filter((f): f is File => f instanceof File);

    if (validFiles.length === 0) {
      return NextResponse.json(
        { 
          ok: false, 
          message: 'No valid files provided',
          error: 'Send multipart/form-data with field name "file" containing at least one valid image file.',
        },
        { status: 400 }
      );
    }

    // Validate file count (prevent too many files at once)
    const maxFiles = 10;
    if (validFiles.length > maxFiles) {
      return NextResponse.json(
        {
          ok: false,
          message: `Too many files`,
          error: `Maximum ${maxFiles} files allowed per request. You provided ${validFiles.length} files.`,
        },
        { status: 400 }
      );
    }

    // Upload files
    try {
      if (validFiles.length === 1) {
        const uploaded = await uploadFileToCloudinary(validFiles[0], folder);

        return NextResponse.json(
          {
            ok: true,
            message: 'Uploaded successfully',
            data: uploaded,
          },
          { status: 200 }
        );
      }

      // Upload multiple files
      const uploadedItems = await Promise.all(
        validFiles.map((file) => uploadFileToCloudinary(file, folder))
      );

      return NextResponse.json(
        {
          ok: true,
          message: `Successfully uploaded ${uploadedItems.length} file(s)`,
          data: {
            items: uploadedItems,
          },
        },
        { status: 200 }
      );
    } catch (uploadError: any) {
      // Re-throw validation errors from uploadFileToCloudinary
      throw uploadError;
    }
  } catch (error: any) {
    // Enhanced error logging
    console.error('Cloudinary upload error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      timestamp: new Date().toISOString(),
    });

    // Determine appropriate status code based on error type
    let statusCode = 500;
    let errorMessage = error?.message || 'Failed to upload image';
    
    if (error?.message?.includes('authentication') || error?.message?.includes('API Key')) {
      statusCode = 500; // Server configuration error
    } else if (error?.message?.includes('File size') || error?.message?.includes('Invalid file type')) {
      statusCode = 400; // Client error - invalid file
    } else if (error?.message?.includes('timeout')) {
      statusCode = 504; // Gateway timeout
    }

    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to upload image',
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
