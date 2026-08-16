export interface ToolContentData {
  shortDescription: string;
  detailedDescription: string;
  howTo: { step: number; title: string; description: string }[];
  features: { title: string; description: string }[];
  supportedInputs: string[];
  outputSpecs: string;
  tips: string[];
  commonIssues: { issue: string; solution: string }[];
  faq: { question: string; answer: string }[];
  relatedToolIds: string[];
}

export const defaultToolContent: Record<string, Partial<ToolContentData>> = {
  'edit-pdf': {
    shortDescription: 'Edit existing PDF text, modify fonts, insert images, add signatures, draw annotations, and redact sensitive information directly in your browser with zero server uploads.',
    detailedDescription: `EditMee's Edit PDF Studio provides deep interactive manipulation of standard PDF documents. Unlike traditional viewers that merely overlay flat stickers on top of rasterized pages, EditMee parses the internal vector text stream and spatial layout matrices. You can click on any existing text block to edit typos, update contact information, replace pricing, or adjust paragraphs.

The editing engine automatically detects original font families (Sans-Serif Helvetica, Serif Times New Roman, Monospace Courier), font weights, italics, and point sizes. Edited text regions are seamlessly masked and re-synthesized using standard PostScript type metrics to ensure pristine alignment across all zoom scales (50% to 300%).

Additionally, the suite includes freehand pen drawing with adjustable stroke smoothing, geometric shapes (rectangles, circles, lines, directional arrows), pre-built and custom approval stamps, digital signatures with bezier curve smoothing, high-resolution image insertion, fillable form field construction, privacy redacting, diagonal security watermarks, and dynamic page numbering.`,
    howTo: [
      { step: 1, title: 'Open or Drop Your PDF', description: 'Click "Open PDF" or drag and drop any PDF file from your device. You can also click "Load Sample PDF" to explore immediately.' },
      { step: 2, title: 'Select Text Edit Mode', description: 'Click the "Edit Text" tool (or press E) in the top toolbar, then click or double-click any existing text block on the page.' },
      { step: 3, title: 'Modify Text & Formatting', description: 'Type your revisions in the in-place editor. Adjust font family, font size, bold, italic, alignment, or color in the contextual formatting bar.' },
      { step: 4, title: 'Add Annotations & Signatures', description: 'Insert signatures, highlight key passages, draw custom shapes, or stamp documents as Approved or Confidential.' },
      { step: 5, title: 'Export & Download', description: 'Click "Export PDF" in the top right to compile all vector edits and annotations into a clean, standard PDF file and save it to your disk.' },
    ],
    features: [
      { title: 'In-Place Text Editing', description: 'Directly modify existing PDF text blocks with automatic font and coordinate matching.' },
      { title: 'Privacy-First Client Processing', description: '100% of PDF parsing, rendering, and export runs in your local browser with no external server transmission.' },
      { title: 'Digital Signatures & Stamps', description: 'Sign with high-precision bezier smoothing or type cursive signatures with instant transparent PNG generation.' },
      { title: 'Search & Replace Engine', description: 'Find text across all pages and execute single or bulk replacements with auto-masking.' },
      { title: 'Page Management & Reordering', description: 'Rotate, duplicate, delete, extract, or reorder pages via the interactive visual thumbnail sidebar.' },
      { title: 'Security Watermarks & Page Numbers', description: 'Apply diagonal copyright watermarks and custom page number formats across the entire document.' },
    ],
    supportedInputs: ['PDF (.pdf, up to version 2.0)', 'Password-protected PDFs (with client unlock)', 'Multi-page documents'],
    outputSpecs: 'Standard ISO 32000 PDF file compatible with Adobe Acrobat, Apple Preview, Google Chrome, and all mobile PDF viewers.',
    tips: [
      'Use keyboard shortcuts (V for Select, E for Text Edit, T for Add Text, Ctrl+Z for Undo) to speed up your workflow.',
      'To preserve alignment on multi-line text, press Shift+Enter to insert new lines without exiting the editor.',
      'Use the Page Thumbnails drawer on the left to reorder pages by dragging or rotating individual pages.',
    ],
    commonIssues: [
      { issue: 'Why does my scanned PDF not allow text editing?', solution: 'Scanned documents contain raster images of text rather than digital vector fonts. Use EditMee OCR & Scanning tools to extract the text first.' },
      { issue: 'Does editing a PDF reduce its visual quality?', solution: 'No. EditMee renders vector glyphs and re-encodes PDF pages using native PostScript streams, preserving crystal-clear sharpness at any resolution.' },
    ],
    faq: [
      { question: 'Is my PDF uploaded to any external server?', answer: 'No. EditMee executes entirely inside your browser using WebAssembly and Web Workers. Your files never leave your device.' },
      { question: 'Can I edit text in multi-column layouts?', answer: 'Yes. EditMee detects individual text bounding boxes and allows you to edit each block independently without disrupting neighboring columns.' },
      { question: 'Does the exported PDF keep original hyperlinks and bookmarks?', answer: 'Standard vector elements, annotations, and page structures are preserved during export.' },
      { question: 'How do I remove sensitive data completely?', answer: 'Use the Redact tool (blackout box) to cover private information. The redacted area is permanently masked in the exported PDF.' },
      { question: 'What font styles are supported for replacement text?', answer: 'Standard PostScript fonts (Helvetica, Times Roman, Courier) with full Bold, Italic, and color variations are supported.' },
    ],
    relatedToolIds: ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'protect-pdf', 'sign-pdf'],
  },

  'merge-pdf': {
    shortDescription: 'Combine multiple PDF documents into a single organized file with customizable page ordering.',
    detailedDescription: 'Merge PDF allows you to assemble contracts, reports, receipts, and multi-part documents into a cohesive single PDF. Drag and drop any number of PDF files, reorder pages, and export instantly.',
    howTo: [
      { step: 1, title: 'Upload PDF Files', description: 'Select or drag multiple PDF files into the upload area.' },
      { step: 2, title: 'Arrange Document Order', description: 'Drag items to reorder how the documents will be combined.' },
      { step: 3, title: 'Merge Documents', description: 'Click Execute Merge to combine the files in your browser.' },
      { step: 4, title: 'Download Result', description: 'Save the merged PDF document to your device.' },
    ],
    features: [
      { title: 'Unlimited File Merging', description: 'Combine 2 to 100+ PDF files in a single pass.' },
      { title: 'Instant Client Execution', description: 'Zero upload lag; documents merge directly in browser memory.' },
      { title: 'Order Customization', description: 'Easily rearrange files before finalizing the merge.' },
    ],
    supportedInputs: ['PDF files (.pdf)'],
    outputSpecs: 'Single consolidated PDF file.',
    tips: ['Ensure individual PDFs are not corrupted before merging.'],
    commonIssues: [{ issue: 'Encrypted PDFs', solution: 'Unlock password-protected files using Unlock PDF prior to merging.' }],
    faq: [
      { question: 'Is there a limit on how many files I can merge?', answer: 'EditMee can merge dozens of files depending on your available device memory.' },
      { question: 'Does merging compress the images inside the PDF?', answer: 'Original image quality and vector assets are kept intact.' },
    ],
    relatedToolIds: ['edit-pdf', 'split-pdf', 'compress-pdf', 'reorder-pdf-pages'],
  },

  'compress-pdf': {
    shortDescription: 'Reduce PDF file sizes significantly while preserving legible text and sharp image quality.',
    detailedDescription: 'Compress PDF optimizes document streams, removes unneeded metadata, and downsamples oversized images to meet email and portal size limits without degrading readability.',
    howTo: [
      { step: 1, title: 'Upload PDF', description: 'Drop your heavy PDF file into the workspace.' },
      { step: 2, title: 'Choose Compression Level', description: 'Select Low, Medium, or High compression.' },
      { step: 3, title: 'Compress', description: 'Click Compress PDF to process the document.' },
      { step: 4, title: 'Download', description: 'Download your optimized, lightweight PDF.' },
    ],
    features: [
      { title: 'Multiple Compression Modes', description: 'Balance file size and graphic fidelity with granular quality sliders.' },
      { title: 'Metadata Stripping', description: 'Removes redundant XML and color profiles to save bytes.' },
    ],
    supportedInputs: ['PDF files (.pdf)'],
    outputSpecs: 'Optimized PDF file with reduced byte size.',
    tips: ['For documents with mostly text, High compression yields massive size reductions with zero visual loss.'],
    commonIssues: [{ issue: 'Scanned image-heavy PDFs', solution: 'Adjust the DPI downsampling setting to achieve maximum size reduction.' }],
    faq: [
      { question: 'Will compression make my text blurry?', answer: 'No. Vector text remains mathematically sharp regardless of compression level.' },
    ],
    relatedToolIds: ['edit-pdf', 'merge-pdf', 'split-pdf', 'pdf-to-jpg'],
  },

  'image-studio': {
    shortDescription: 'All-in-one client-side image editor: resize, crop, convert formats, remove background, apply filters, and compress.',
    detailedDescription: 'Image Studio provides a comprehensive visual playground for editing photos, graphics, banners, and icons. Perform lossless conversions between PNG, JPEG, WebP, and AVIF, fine-tune brightness and contrast, resize with aspect-ratio locking, and crop to preset dimensions.',
    howTo: [
      { step: 1, title: 'Upload Image', description: 'Select or drag any image file (PNG, JPG, WebP, SVG, BMP).' },
      { step: 2, title: 'Select Operations', description: 'Choose from Resize, Crop, Filter, Color Adjustments, or Watermark.' },
      { step: 3, title: 'Preview in Real Time', description: 'Inspect the live canvas preview to verify changes.' },
      { step: 4, title: 'Export', description: 'Download your edited image in your preferred format and quality.' },
    ],
    features: [
      { title: 'Multi-Format Support', description: 'Supports JPEG, PNG, WebP, GIF, SVG, BMP, and ICO.' },
      { title: 'Aspect-Ratio Constrained Resizing', description: 'Scale by width, height, percentage, or target file size.' },
      { title: 'Canvas Filters & Effects', description: 'Apply grayscale, sepia, invert, blur, brightness, and contrast adjustments.' },
    ],
    supportedInputs: ['PNG, JPG, JPEG, WebP, SVG, GIF, BMP'],
    outputSpecs: 'High-quality image in PNG, JPEG, or WebP format.',
    tips: ['Use WebP format for optimal balance of transparency and low file size on modern websites.'],
    commonIssues: [{ issue: 'Large files lag on mobile', solution: 'Resize images above 4000px before applying heavy blur filters.' }],
    faq: [
      { question: 'Does Image Studio support transparency?', answer: 'Yes, PNG and WebP exports fully preserve transparent alpha channels.' },
    ],
    relatedToolIds: ['compress-image', 'image-converter', 'resize-image', 'background-remover'],
  },

  'resume-builder': {
    shortDescription: 'Build professional, ATS-optimized resumes with modern typography, executive layouts, and instant PDF export.',
    detailedDescription: 'The Resume & Career Suite empowers job seekers to create high-impact resumes tailored to modern applicant tracking systems (ATS). Enter your experience, education, skills, and summary, and choose between Modern, Minimal, and Executive PDF layout templates.',
    howTo: [
      { step: 1, title: 'Enter Personal & Contact Details', description: 'Fill in your name, job title, email, phone, location, and LinkedIn profile.' },
      { step: 2, title: 'Add Work Experience', description: 'List your past roles, companies, dates, and bulleted achievements.' },
      { step: 3, title: 'Add Education & Skills', description: 'Highlight your degrees, certifications, and technical proficiencies.' },
      { step: 4, title: 'Select Template & Accent Color', description: 'Choose Modern, Executive, or Minimal layout style.' },
      { step: 5, title: 'Download PDF', description: 'Generate a clean, print-ready PDF resume.' },
    ],
    features: [
      { title: 'ATS-Friendly Formatting', description: 'Standard fonts and semantic hierarchy ensure seamless parsing by recruiting software.' },
      { title: 'Live Dynamic Preview', description: 'See your resume update in real time as you type.' },
      { title: 'Multiple Layout Archetypes', description: 'Switch between Modern Tech, Minimalist, and Executive styles with one click.' },
    ],
    supportedInputs: ['Manual form input, JSON resume data import'],
    outputSpecs: 'Standard A4/Letter vector PDF document.',
    tips: ['Use quantifiable action verbs (e.g. "Increased throughput by 42%") in your experience bullet points.'],
    commonIssues: [{ issue: 'Text overflowing page', solution: 'Keep experience summaries concise or adjust font sizing in the theme settings.' }],
    faq: [
      { question: 'Are the generated resumes ATS-compliant?', answer: 'Yes. They use standard vector text without non-standard layers that confuse ATS parsers.' },
    ],
    relatedToolIds: ['resume-analyzer', 'resume-tailor', 'cover-letter-generator', 'edit-pdf'],
  },

  'csv-studio': {
    shortDescription: 'Clean, filter, transform, visualize, and convert CSV and tabular data with instant charts and SQL-like queries.',
    detailedDescription: 'CSV Studio is a versatile client-side data laboratory. Import CSV, TSV, or JSON datasets, clean empty cells, deduplicate rows, filter columns, generate summary statistics, and export to Excel, JSON, or SQL insert statements.',
    howTo: [
      { step: 1, title: 'Import Dataset', description: 'Upload a CSV or TSV file or paste raw delimited text.' },
      { step: 2, title: 'Inspect & Clean', description: 'Detect data types, remove duplicates, and trim whitespace.' },
      { step: 3, title: 'Filter & Transform', description: 'Apply column-based filters, sorting, and math transformations.' },
      { step: 4, title: 'Export', description: 'Download clean CSV, Excel-compatible format, or JSON.' },
    ],
    features: [
      { title: 'Zero-Memory Leak Virtualized Grid', description: 'Inspect thousands of rows smoothly with instant sorting.' },
      { title: 'Multi-Format Conversion', description: 'Convert between CSV, JSON, SQL, TSV, and Markdown tables.' },
      { title: 'Statistical Summaries', description: 'Automatic calculation of min, max, mean, and unique counts per column.' },
    ],
    supportedInputs: ['CSV, TSV, JSON, Delimited text files'],
    outputSpecs: 'CSV, JSON, SQL queries, or Markdown tables.',
    tips: ['Use the SQL export feature to quickly seed relational databases.'],
    commonIssues: [{ issue: 'Mismatched delimiters', solution: 'Select the correct delimiter (Comma, Tab, Semicolon, Pipe) in the format dropdown.' }],
    faq: [
      { question: 'Is my sensitive financial or customer data safe?', answer: 'Yes. CSV Studio processes all data 100% locally in your browser memory.' },
    ],
    relatedToolIds: ['json-formatter', 'csv-to-json', 'json-to-csv', 'data-visualizer'],
  },

  'dev-studio': {
    shortDescription: 'Essential developer toolkit: JSON formatter, Base64 encoder/decoder, JWT debugger, Regex tester, and Hash generator.',
    detailedDescription: 'Developer Studio consolidates everyday engineering utilities into a unified workstation. Format and validate JSON, encode/decode URLs and Base64 payloads, inspect JWT tokens, test regular expressions, and compute cryptographic hashes (SHA-256, MD5) instantly.',
    howTo: [
      { step: 1, title: 'Choose Developer Tool', description: 'Select JSON, Base64, JWT, Regex, or Hash from the tabs.' },
      { step: 2, title: 'Paste Input Payload', description: 'Enter your code, payload, or token into the editor.' },
      { step: 3, title: 'Execute & Format', description: 'View formatted output, syntax tree, or computed cryptographic hash.' },
      { step: 4, title: 'Copy or Download', description: 'Copy results to clipboard with one click.' },
    ],
    features: [
      { title: 'Syntax Highlighting', description: 'Clear visual color coding for JSON, tokens, and regular expressions.' },
      { title: 'Cryptographic Hashing', description: 'Native Web Crypto API for ultra-fast SHA-256, SHA-512, and SHA-1 calculation.' },
      { title: 'JWT Payload Inspector', description: 'Inspect headers, claims, expiration dates, and issued-at timestamps.' },
    ],
    supportedInputs: ['Plain text, JSON strings, Base64 tokens, JWT strings'],
    outputSpecs: 'Formatted text, validated JSON, or cryptographic checksums.',
    tips: ['Use Ctrl+Enter to re-format or test regex expressions instantly.'],
    commonIssues: [{ issue: 'Invalid JSON error', solution: 'Check for trailing commas or missing quotation marks around object keys.' }],
    faq: [
      { question: 'Does Developer Studio send my API keys or tokens anywhere?', answer: 'Never. All operations execute strictly in your local browser sandbox.' },
    ],
    relatedToolIds: ['json-formatter', 'base64-encode-decode', 'hash-generator', 'regex-tester'],
  },
};

export function getToolContent(toolId: string, category: string, toolName: string): ToolContentData {
  const existing = defaultToolContent[toolId];
  if (existing && existing.detailedDescription && existing.howTo) {
    return existing as ToolContentData;
  }

  // Generate robust, unique, professional content tailored to that tool
  const catCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    shortDescription: existing?.shortDescription || `Fast, private, and client-side ${toolName} to process your ${category} tasks directly in your browser.`,
    detailedDescription: existing?.detailedDescription || `${toolName} is part of the EditMee ${catCapitalized} Suite. It enables professionals, students, and creators to execute high-performance ${category} operations with precision, safety, and zero upload latency. Built with modern web standards, all processing is performed locally on your device to guarantee maximum data privacy.`,
    howTo: existing?.howTo || [
      { step: 1, title: 'Upload or Configure Input', description: `Select your input file or provide parameters required for ${toolName}.` },
      { step: 2, title: 'Adjust Options & Settings', description: 'Fine-tune processing preferences, quality levels, or target formats.' },
      { step: 3, title: 'Execute Tool', description: `Click "Run ${toolName}" to start client-side processing.` },
      { step: 4, title: 'Preview & Verify', description: 'Review the generated output preview in the interactive viewer.' },
      { step: 5, title: 'Download Result', description: 'Save the processed file or copy the result to your clipboard.' },
    ],
    features: existing?.features || [
      { title: '100% Client-Side Processing', description: 'Your files and data remain secure on your device without server transmission.' },
      { title: 'High Throughput & Speed', description: 'Optimized algorithms ensure instantaneous turnaround even on large inputs.' },
      { title: 'Standard Export Formats', description: 'Outputs clean, universally compatible files and assets.' },
      { title: 'Batch Processing Support', description: 'Process multiple items simultaneously with automated queue management.' },
    ],
    supportedInputs: existing?.supportedInputs || [`Standard ${category} files and inputs`, 'Single or batch files'],
    outputSpecs: existing?.outputSpecs || `High-fidelity output compliant with standard ${category} specifications.`,
    tips: existing?.tips || [
      'Bookmark this tool or add it to your favorites using the star icon for instant one-click access.',
      'Use batch processing mode if you have multiple files to convert or process at once.',
    ],
    commonIssues: existing?.commonIssues || [
      { issue: 'File size limitations', solution: 'EditMee can handle large files constrained only by your device memory.' },
      { issue: 'Unsupported file extension', solution: 'Ensure your file matches the accepted input format specifications.' },
    ],
    faq: existing?.faq || [
      { question: `Is ${toolName} free to use?`, answer: 'Yes! All EditMee tools are fully functional and accessible without requiring account creation.' },
      { question: 'Are my files stored on EditMee servers?', answer: 'No. All processing happens entirely inside your browser runtime for complete privacy.' },
      { question: 'Can I use this tool on mobile devices?', answer: 'Yes, EditMee is fully responsive and optimized for desktop, tablet, and mobile browsers.' },
    ],
    relatedToolIds: existing?.relatedToolIds || ['edit-pdf', 'image-studio', 'resume-builder', 'csv-studio', 'dev-studio'],
  };
}
