declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';

// File ini memberitahu TypeScript cara menangani impor file CSS
// agar tidak muncul error merah di editor.

// Untuk CSS Modules (jika kamu pakai file .module.css)
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Untuk impor CSS global (seperti globals.css dan bootstrap.min.css)
declare module '*.css' {
  const content: any;
  export default content;
}
