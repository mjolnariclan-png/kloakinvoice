const SUPABASE_URL = 'https://dhzrhgyjpqotoujfwdwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoenJoZ3lqcHFvdG91amZ3ZHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTk0MzcsImV4cCI6MjA5OTk3NTQzN30.rK02i_fFqcsZO6s9TCy-WUhXYic7Gg7p1Lrfrdu0qqI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.querySelector('.order-form');
const status = document.getElementById('form-status');

function setStatus(message) {
  if (!status) return;
  status.textContent = message;
}

async function uploadFiles(files) {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadedFiles = [];

  for (const file of files) {
    const filePath = `orders/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('print-uploads').upload(filePath, file);

    if (error) {
      console.warn('Storage upload failed:', error.message);
      continue;
    }

    uploadedFiles.push({ name: file.name, path: filePath });
  }

  return uploadedFiles;
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');

    setStatus('Submitting your order to Supabase...');
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
      const formData = new FormData(form);
      const files = Array.from(formData.getAll('files')).filter((file) => file instanceof File);
      const uploadedFiles = await uploadFiles(files);
      const selectedColors = formData.getAll('colors');
      const allowGalleryPost = formData.get('allowGalleryPost') === 'on';

      const order = {
        name: (formData.get('name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        phone: (formData.get('phone') || '').toString().trim(),
        service: (formData.get('service') || '').toString().trim(),
        deadline: (formData.get('deadline') || '').toString().trim(),
        notes: (formData.get('notes') || '').toString().trim(),
        venmo_handle: (formData.get('venmoHandle') || '').toString().trim(),
        source_link: (formData.get('sourceLink') || '').toString().trim(),
        selected_colors: selectedColors,
        allow_gallery_post: allowGalleryPost,
        file_names: uploadedFiles.map((item) => item.name),
        file_paths: uploadedFiles.map((item) => item.path),
        status: 'new',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('orders').insert([order]);

      if (error) {
        throw error;
      }

      setStatus('Your order was received. We will reach out with a quote and payment instructions soon.');
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'The order could not be saved right now.');
    } finally {
      button.disabled = false;
      button.textContent = 'Send order';
    }
  });
}
