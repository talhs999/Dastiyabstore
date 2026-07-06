import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'zpbci6tf',
  api_key: process.env.CLOUDINARY_API_KEY || '925577957857674',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'e5sMu-FXAwQhnreh2-qIePzY28c'
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload the file buffer to Cloudinary directly
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'dastiyabstore',
          // Automatically optimize the format and quality when the image is uploaded
          format: 'webp' 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      // Pass the buffer to the stream
      uploadStream.end(buffer);
    });

    // We get a secure URL back from Cloudinary (https)
    const publicUrl = (uploadResult as any).secure_url;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
