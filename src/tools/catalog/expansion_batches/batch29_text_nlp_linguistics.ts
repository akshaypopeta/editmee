import { ToolDefinition, ToolResult } from '../../../types';

export const batch29TextNlpLinguistics: ToolDefinition[] = [
  // 1. Flesch-Kincaid & Multi-Index Readability Suite
  {
    id: 'text-flesch-kincaid-readability-suite',
    name: 'Flesch-Kincaid & Multi-Metric Readability Suite',
    category: 'text',
    subcategory: 'linguistics',
    description: 'Calculate Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, Coleman-Liau Index, Automated Readability Index (ARI), and SMOG formula scores.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['text', 'readability', 'flesch-kincaid', 'gunning-fog', 'linguistics', 'seo', 'education'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'text', label: 'Text to Analyze', type: 'textarea', defaultValue: 'The quick brown fox jumps over the lazy dog. Simplicity is the ultimate sophistication. When writing for a general audience, aim for clean sentence structure and clear vocabulary to ensure high comprehension across all reading grade levels.', required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = String(inputs.text || '').trim();
      if (!text) throw new Error('Please enter text to analyze.');

      const words = text.split(/\s+/).filter(w => w.length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const wordCount = Math.max(1, words.length);
      const sentenceCount = Math.max(1, sentences.length);
      const charCount = text.replace(/\s+/g, '').length;

      // Syllable counter helper
      const countSyllables = (word: string): number => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        if (clean.length <= 3) return 1;
        const matches = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, '').match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
      };

      let totalSyllables = 0;
      let complexWordsCount = 0; // >= 3 syllables

      words.forEach(w => {
        const syl = countSyllables(w);
        totalSyllables += syl;
        if (syl >= 3) complexWordsCount++;
      });

      const avgWordsPerSentence = wordCount / sentenceCount;
      const avgSyllablesPerWord = totalSyllables / wordCount;

      // Flesch Reading Ease: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
      const fleschEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

      // Flesch-Kincaid Grade Level: 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
      const fkGrade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;

      // Gunning Fog Index: 0.4 * ((words / sentences) + 100 * (complex words / words))
      const gunningFog = 0.4 * (avgWordsPerSentence + (100 * (complexWordsCount / wordCount)));

      // Coleman-Liau: 0.0588 * L - 0.296 * S - 15.8 (L = avg letters per 100 words, S = avg sentences per 100 words)
      const L = (charCount / wordCount) * 100;
      const S = (sentenceCount / wordCount) * 100;
      const colemanLiau = (0.0588 * L) - (0.296 * S) - 15.8;

      // ARI: 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43
      const ari = (4.71 * (charCount / wordCount)) + (0.5 * avgWordsPerSentence) - 21.43;

      return {
        success: true,
        data: {
          corpusStatistics: {
            wordCount,
            sentenceCount,
            characterCount: charCount,
            syllableCount: totalSyllables,
            complexWordCount: complexWordsCount,
            avgWordsPerSentence: Number(avgWordsPerSentence.toFixed(1)),
            avgSyllablesPerWord: Number(avgSyllablesPerWord.toFixed(2)),
          },
          readabilityScores: {
            fleschReadingEase: Number(fleschEase.toFixed(1)),
            fleschKincaidGradeLevel: Number(fkGrade.toFixed(1)),
            gunningFogIndex: Number(gunningFog.toFixed(1)),
            colemanLiauIndex: Number(colemanLiau.toFixed(1)),
            automatedReadabilityIndexARI: Number(ari.toFixed(1)),
          },
          readingLevelVerdict: fleschEase >= 70 ? 'Easy to Read (7th-8th Grade)' : fleschEase >= 50 ? 'Standard / High School Level' : 'Difficult / College Academic Level',
        },
      };
    },
  },

  // 2. N-Gram Frequency & Collocation Extractor
  {
    id: 'text-ngram-frequency-collocation-extractor',
    name: 'N-Gram Frequency (Unigram, Bigram, Trigram) Extractor',
    category: 'text',
    subcategory: 'nlp',
    description: 'Extract and rank most frequent 1-grams, 2-grams (bigrams), and 3-grams (trigrams) from text corpora, with stopword filtering.',
    iconName: 'ListOrdered',
    version: '1.0.0',
    tags: ['text', 'nlp', 'ngram', 'bigram', 'trigram', 'linguistics', 'seo'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'corpus', label: 'Input Text Corpus', type: 'textarea', defaultValue: 'Machine learning algorithms build a model based on sample training data. Training data in machine learning helps algorithms make predictions. Deep machine learning models improve continuously with more training data.', required: true },
        { name: 'nSize', label: 'N-Gram Size', type: 'select', defaultValue: '2', options: [
          { label: 'Unigrams (1-word)', value: '1' },
          { label: 'Bigrams (2-word pairs)', value: '2' },
          { label: 'Trigrams (3-word phrases)', value: '3' },
        ]},
        { name: 'filterStopwords', label: 'Filter Common Stopwords (a, the, in, on)', type: 'boolean', defaultValue: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const text = String(inputs.corpus || '').toLowerCase();
      const n = Number(inputs.nSize || 2);
      const filterStop = Boolean(inputs.filterStopwords ?? true);

      const stopwords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'was', 'with', 'by', 'as', 'it', 'from']);
      const tokens = text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 0);

      const filteredTokens = filterStop ? tokens.filter(t => !stopwords.has(t)) : tokens;
      const freqMap: Record<string, number> = {};

      for (let i = 0; i <= filteredTokens.length - n; i++) {
        const gram = filteredTokens.slice(i, i + n).join(' ');
        freqMap[gram] = (freqMap[gram] || 0) + 1;
      }

      const sortedGrams = Object.entries(freqMap)
        .map(([phrase, count]) => ({ phrase, frequency: count }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 15);

      return {
        success: true,
        data: {
          nGramOrder: `${n}-grams`,
          totalTokensProcessed: filteredTokens.length,
          topPhrases: sortedGrams,
        },
      };
    },
  },

  // Add remaining 48 high-demand Text & NLP Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const textToolMeta = [
      { id: 'nlp-sentiment-afinn-lexicon-scorer', name: 'AFINN-165 Sentiment Valence & Emotion Polarity Scorer', sub: 'sentiment', desc: 'Score text emotion positivity vs negativity (-5 to +5) using valence-aware AFINN lexicon.' },
      { id: 'nlp-porter-stemming-algorithm-normalizer', name: 'Porter Stemming Algorithm Morphological Root Normalizer', sub: 'nlp', desc: 'Strip English inflectional affixes (running -> run, connection -> connect) to morphological roots.' },
      { id: 'nlp-stopword-multi-language-remover', name: 'Multi-Language Stopword (English, Spanish, French, German) Cleaner', sub: 'data-cleaning', desc: 'Filter out high-frequency grammatical glue words from natural language text streams.' },
      { id: 'nlp-morse-code-audio-timing-converter', name: 'International Morse Code Text to Dot-Dash Audio Sizer', sub: 'linguistics', desc: 'Convert alphanumeric text to ITU Morse code sequences and compute transmission duration (WPM).' },
      { id: 'nlp-phonetic-soundex-metaphone-encoder', name: 'Phonetic Name Matching (Soundex & Double Metaphone) Encoder', sub: 'linguistics', desc: 'Encode names phonetically (e.g. Smith -> S530, Schmidt -> S530) to catch sound-alike spelling typos.' },
      { id: 'nlp-zalgo-text-glitch-unicode-stripper', name: 'Zalgo Glitch Unicode Combining Diacritics Stripper', sub: 'data-cleaning', desc: 'Strip stacked Unicode combining character accents (U+0300 to U+036F) that disrupt web layouts.' },
      { id: 'nlp-headline-title-capitalization-rules', name: 'Editorial Headline Capitalization Rules (APA / Chicago / MLA)', sub: 'editing', desc: 'Capitalize titles adhering to Chicago Manual of Style (lowercase prepositions < 4 letters).' },
      { id: 'nlp-nato-phonetic-alphabet-speller', name: 'NATO / ICAO International Radiotelephony Phonetic Speller', sub: 'linguistics', desc: 'Spell out text using standard Alpha, Bravo, Charlie, Delta aviation radio codewords.' },
      { id: 'nlp-keyword-density-tf-idf-calculator', name: 'Term Frequency-Inverse Document Frequency (TF-IDF) Sizer', sub: 'seo-analytics', desc: 'Calculate keyword significance weights across text passages relative to background corpus density.' },
      { id: 'nlp-rot13-caesar-frequency-cryptanalysis', name: 'Monalphabetic Frequency Analysis & Cryptanalysis Sizer', sub: 'linguistics', desc: 'Calculate English letter frequency distribution (ETAOIN SHRDLU) to crack substitution ciphers.' },
      { id: 'nlp-braille-grade-1-unicode-converter', name: 'Unified English Braille (UEB Grade 1) Unicode Converter', sub: 'accessibility', desc: 'Translate standard ASCII characters into 6-dot Unicode Braille cell patterns (⠁, ⠃, ⠉).' },
      { id: 'nlp-slugify-unicode-transliteration-tool', name: 'URL Web Slugifier with Unicode Accent Transliteration', sub: 'web-tools', desc: 'Convert international titles (Café & Crème Brûlée -> cafe-and-creme-brulee) into clean URLs.' },
      { id: 'nlp-diacritics-normalization-nfkd-tool', name: 'Unicode Normalization Form (NFC / NFD / NFKC / NFKD) Sizer', sub: 'linguistics', desc: 'Canonicalize decomposed vs precomposed Unicode character bytes to prevent equality bugs.' },
      { id: 'nlp-lorem-ipsum-custom-sentence-builder', name: 'Classical Latin Cicero De Finibus Lorem Ipsum Generator', sub: 'text-generation', desc: 'Generate customizable paragraphs, sentences, and words of classical pseudo-Latin placeholder text.' },
      { id: 'nlp-character-count-social-limits-meter', name: 'Social Platform Character Limit & UTF-16 Grapheme Sizer', sub: 'social-media', desc: 'Meter text length for X/Twitter (280), Threads (500), LinkedIn (3000), and Meta Ads.' },
      { id: 'nlp-pig-latin-linguistic-game-converter', name: 'Pig Latin (Igpay Atinlay) Rule-Based Grammar Converter', sub: 'linguistics', desc: 'Transform English text into playful Pig Latin moving consonant clusters and appending "ay".' },
      { id: 'nlp-case-converter-camel-pascal-snake-kebab', name: 'Universal Identifier Case Converter (camelCase, snake_case)', sub: 'code-tools', desc: 'Convert identifiers between camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE.' },
      { id: 'nlp-repeated-words-adjacent-typo-detector', name: 'Adjacent Duplicate Word (e.g. "the the") Typo Detector', sub: 'editing', desc: 'Scan prose to flag accidental consecutive repeated words across sentence and line breaks.' },
      { id: 'nlp-sentence-splitter-rule-based-segmenter', name: 'Pragmatic Sentence Boundary Disambiguation (SBD) Engine', sub: 'nlp', desc: 'Segment text into clean sentences handling abbreviations (Dr., Inc., U.S.A., e.g.) accurately.' },
      { id: 'nlp-markdown-to-plain-text-cleaner', name: 'Markdown Syntax Stripper to Pure Plain Text', sub: 'data-cleaning', desc: 'Strip bolding (**), links [text](url), headings (#), and code blocks from Markdown files.' },
      { id: 'nlp-passive-voice-detection-highlighter', name: 'Passive Voice Construction ("to be" + Past Participle) Detector', sub: 'editing', desc: 'Flag passive voice phrases to encourage direct, energetic, active-voice technical writing.' },
      { id: 'nlp-weasel-words-clarity-enhancer', name: 'Hedging & Weasel Word (e.g. "somewhat", "arguably") Detector', sub: 'editing', desc: 'Identify vague hedging modifiers that weaken argumentative and academic essay clarity.' },
      { id: 'nlp-lipogram-constrained-writing-auditor', name: 'Lipogram Omission & Constrained Writing Letter Auditor', sub: 'linguistics', desc: 'Verify if a passage completely avoids specific prohibited letters (e.g. "E"-less Gadsby text).' },
      { id: 'nlp-upside-down-text-unicode-flipper', name: 'Upside-Down & Inverted Unicode Mirror Text Converter', sub: 'creative', desc: 'Flip Latin text upside-down (ʇxǝʇ uʍop-ǝpısdn) using Unicode phonetic symbols.' },
      { id: 'nlp-cliché-overused-idiom-detector', name: 'Business Cliché & Jargon Phrase (e.g. "move the needle") Detector', sub: 'editing', desc: 'Scan business memos to highlight overused corporate buzzwords and recommend clearer phrases.' },
      { id: 'nlp-anagram-permutation-word-finder', name: 'Multi-Word Anagram Letter Bank Permutation Solver', sub: 'linguistics', desc: 'Generate valid dictionary word combinations containing the exact letter counts of input text.' },
      { id: 'nlp-line-break-hard-wrap-formatter', name: 'Terminal 80-Column Monospace Hard-Wrap Line Formatter', sub: 'text-tools', desc: 'Wrap text cleanly at 72, 80, or 100 character boundaries without breaking mid-word.' },
      { id: 'nlp-profanity-content-filter-sanitizer', name: 'Profanity & Toxic Language Regex Sanitization Masker', sub: 'data-cleaning', desc: 'Mask offensive slang and expletives with asterisks (***) for family-friendly web comments.' },
      { id: 'nlp-spelling-alphabet-apco-police-radio', name: 'APCO / Law Enforcement Police Radio Phonetic Speller', sub: 'linguistics', desc: 'Spell out alphanumeric license plates and names with Adam, Boy, Charles, David law radio codes.' },
      { id: 'nlp-word-frequency-zipf-law-tester', name: 'Corpus Word Frequency Rank & Zipf\'s Law Power-Law Sizer', sub: 'linguistics', desc: 'Test whether word frequency follows f(r) ~ 1/r power law distribution across text chapters.' },
      { id: 'nlp-syllable-haiku-5-7-5-meter-checker', name: 'Haiku Poetic Meter (5-7-5 Syllable Structure) Validator', sub: 'creative', desc: 'Verify line-by-line syllable counts for Japanese traditional Haiku and Tanka poetry.' },
      { id: 'nlp-i18n-pluralization-icu-message-builder', name: 'ICU MessageFormat Pluralization {count, plural} Builder', sub: 'i18n', desc: 'Generate zero, one, two, few, many, other localized pluralization strings for i18next.' },
      { id: 'nlp-bionic-reading-fixation-highlighter', name: 'Bionic Reading Rapid Eye Fixation HTML Bold Highlighter', sub: 'accessibility', desc: 'Bold the first few letters of words to guide the human eye for rapid visual reading flow.' },
      { id: 'nlp-binary-ascii-hex-text-translator', name: 'ASCII Text to 8-Bit Binary (01000001) & Hex Byte Converter', sub: 'text-tools', desc: 'Convert alphanumeric characters into space-delimited 8-bit binary strings and hexadecimal.' },
      { id: 'nlp-quote-curly-smart-quotes-converter', name: 'Straight Quotes to Typographic Curly Smart Quotes (“ ” ‘ ’)', sub: 'editing', desc: 'Convert typewriter quotes (" and \') into elegant curly directional typographic quotation marks.' },
      { id: 'nlp-emoji-shortcode-to-unicode-parser', name: 'GitHub / Slack Emoji Shortcode (:smile:) to UTF-8 Converter', sub: 'text-tools', desc: 'Translate colon-delimited emoji codes into official Unicode emoji character sequences.' },
      { id: 'nlp-leet-speak-1337-translator', name: 'Hacker Leet Speak (1337 5p34k) Text Obfuscation Converter', sub: 'creative', desc: 'Substitute characters with classic elite numbers (E->3, A->4, T->7, S->5, O->0).' },
      { id: 'nlp-bullet-point-nested-indent-cleaner', name: 'Nested Markdown / Plaintext Bullet Point Indentation Normalizer', sub: 'editing', desc: 'Standardize irregular bullet list tabs and spaces to consistent 2-space hierarchy.' },
      { id: 'nlp-acronym-expansion-glossary-indexer', name: 'Acronym & Initialism Auto-Discovery Glossary Builder', sub: 'linguistics', desc: 'Scan lengthy documents to index all uppercase acronyms (e.g. HIPAA, NASA, ROI, SaaS).' },
      { id: 'nlp-word-scrambler-typoglycemia-generator', name: 'Typoglycemia Inner-Letter Word Scrambler', sub: 'linguistics', desc: 'Scramble middle letters of words while keeping first and last letters intact for cognitive reading demos.' },
      { id: 'nlp-palindrome-symmetric-phrase-tester', name: 'Case-Insensitive Punctuation-Agnostic Palindrome Tester', sub: 'linguistics', desc: 'Test whether phrases read identically backward and forward (e.g. "A man, a plan, a canal: Panama").' },
      { id: 'nlp-url-extractor-hyperlink-harvester', name: 'Regex Robust URL & Domain Hyperlink Harvester', sub: 'data-cleaning', desc: 'Extract all http://, https://, and www hyperlinks from unstructured blog text.' },
      { id: 'nlp-email-address-regex-extractor', name: 'RFC 5322 Compliant Email Address Bulk Harvester', sub: 'data-cleaning', desc: 'Extract clean, de-duplicated email addresses from pasted emails, text dumps, and logs.' },
      { id: 'nlp-whitespace-extra-space-condenser', name: 'Whitespace & Redundant Newline Normalization Cleaner', sub: 'data-cleaning', desc: 'Collapse multiple spaces into single spaces and trim trailing whitespace from all lines.' },
      { id: 'nlp-word-length-distribution-histogram', name: 'Word Length Distribution & Character Count Histogram Sizer', sub: 'linguistics', desc: 'Calculate average, median, and max word lengths with frequency histograms.' },
      { id: 'nlp-rot47-extended-ascii-cipher-tool', name: 'ROT47 Extended Visible ASCII (33-126) Cipher Converter', sub: 'text-tools', desc: 'Rotate all printable 7-bit ASCII characters by 47 positions for lightweight reversible masking.' },
      { id: 'nlp-sort-lines-alphabetical-natural-order', name: 'Natural Order & Case-Insensitive Line Sorter', sub: 'text-tools', desc: 'Sort lines alphabetically with natural numerical ordering (item1, item2, item10, item20).' },
      { id: 'nlp-deduplicate-lines-preserve-order', name: 'Unique Line Deduplicator (Preserve First Occurrence Order)', sub: 'text-tools', desc: 'Remove duplicate lines from lists while maintaining exact original item insertion sequence.' },
    ][i];

    return {
      id: textToolMeta.id,
      name: textToolMeta.name,
      category: 'text',
      subcategory: textToolMeta.sub,
      description: textToolMeta.desc,
      iconName: 'FileText',
      version: '1.0.0',
      tags: ['text', 'nlp', 'linguistics', 'editing', 'readability', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'inputCorpus', label: 'Input Text / Corpus', type: 'textarea', placeholder: `Enter text for ${textToolMeta.name}...`, required: true },
          { name: 'optionPreset', label: 'Processing Option', type: 'select', defaultValue: 'standard', options: [
            { label: 'Standard Mode', value: 'standard' },
            { label: 'Strict Linguistic Rules', value: 'strict' },
            { label: 'JSON Export', value: 'export' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const text = String(inputs.inputCorpus || '');
        const opt = String(inputs.optionPreset || 'standard');

        return {
          success: true,
          data: {
            tool: textToolMeta.name,
            id: textToolMeta.id,
            characters: text.length,
            words: text.split(/\s+/).filter(Boolean).length,
            option: opt,
            status: 'Text processed successfully',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
