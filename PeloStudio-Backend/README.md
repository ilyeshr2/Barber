# PeloStudio Backend

Backend API for the PeloStudio barber shop application.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` and update the values
   - Set DB credentials and other configuration

3. Start the development server:
   ```
   npm run dev
   ```

## Asset Management

The application now uses local storage for all assets (images) instead of Cloudinary. Files are stored in the `uploads` directory and metadata is tracked in the database.

### Importing App Assets

To import existing images from the app's assets directory:

```
node scripts/importLocalAssets.js
```

This script will:
1. Copy images from `app/assets/images` to appropriate folders in `uploads/`
2. Store file metadata in the database
3. Update references in the database (barbers, salon, publications)

### File Storage API

The admin dashboard can use the file storage API to upload and manage images:

- **Upload File**: `POST /api/admin/files/upload`
  - Form data with `file` field and optional `category` field
  - Returns file metadata including path

- **Get All Files**: `GET /api/admin/files`
  - Optional query param: `category` to filter by category

- **Get File By ID**: `GET /api/admin/files/:id`

- **Delete File**: `DELETE /api/admin/files/:id`

- **Search Files**: `GET /api/admin/files/search`
  - Query params: `query` (filename search) and optional `category`

### File Categories

Files are organized into these categories:
- `barbers`: Barber profile photos
- `salon`: Salon logo and images
- `publications`: Social media posts and author images
- `users`: User profile pictures
- `misc`: Miscellaneous images

## Database

The application uses PostgreSQL. To reset the database and seed with initial data:

```
npm run db:reset
```

## Development

To start the server in development mode with auto-reload:

```
npm run dev
``` 