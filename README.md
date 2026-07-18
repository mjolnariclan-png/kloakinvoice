# kloakinvoice

A Viking-themed invoice ordering site built as a static GitHub Pages experience.

## What changed
- The site now uses Supabase instead of a local Node server for storing orders.
- The order form submits directly from the browser to a Supabase table.
- File uploads are attempted to a Supabase Storage bucket named print-uploads.

## Supabase setup
1. Open your Supabase project SQL editor.
2. Run the SQL from [supabase-setup.sql](supabase-setup.sql).
3. Create a storage bucket named print-uploads.
4. Make sure the bucket is allowed for uploads from the anon role.

## GitHub Pages deployment
1. Push this repository to GitHub.
2. In GitHub, open Settings > Pages.
3. Choose the main branch and the root folder.
4. Deploy.
5. Your site will be available at https://<your-username>.github.io/<repo-name>/.

## Local preview
Run a simple static server from the project root:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.
