import type { AdBrief, NicheTemplate, VoicePreset } from '../types/adforge';

export const DEFAULT_BRIEF: AdBrief = {
  productName: '',
  productDescription: '',
  targetAudience: '',
  mainOffer: '',
  emotionTone: 'Urgent',
  adGoal: 'sales',
  preferredStyle: 'UGC',
  language: 'hinglish',
  videoLength: '30s',
  scriptCount: 4,
};

export const NICHE_TEMPLATES: NicheTemplate[] = [
  {
    id: 'rudrasacred-karungali',
    niche: 'Rudra Sacred · Spiritual',
    title: 'Karungali (Ebony Wood) Mala & Bracelet — rudrasacred.in',
    summary: 'Authentic sacred Karungali mala/bracelet UGC ad focused on daily calm, focus, and originality trust.',
    brief: {
      productName: 'Rudra Sacred Original Karungali Mala & Bracelet',
      productDescription:
        '100% natural, unpolished black ebony wood (Karungali) mala and bracelet from rudrasacred.in — traditionally worn for mental calm, focus, positive aura, and grounding during meditation or daily work.',
      targetAudience:
        'Indian men & women aged 24–48 feeling mentally drained, distracted, or stressed, looking for authentic non-dyed spiritual wear with Cash on Delivery.',
      mainOffer: 'Build Your Own Combo Offer + Pan-India Free Shipping + COD + 7-Day Easy Return',
      emotionTone: 'Trustworthy',
      adGoal: 'sales',
      preferredStyle: 'UGC',
      language: 'hinglish',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'rudrasacred-pyrite',
    niche: 'Rudra Sacred · Crystals',
    title: 'Pyrite & Money Magnet Crystal Bracelet — rudrasacred.in',
    summary: 'Problem-Solution desk/business creator hook for Pyrite, Tiger Eye, and Rashi crystal bracelets.',
    brief: {
      productName: 'Rudra Sacred Pyrite & Money Magnet Bracelet',
      productDescription:
        'Natural energized Pyrite, Citrine & Tiger Eye crystal bracelet from rudrasacred.in, paired with the "Find Your Stone" birth-date Rashi & Mulank guide.',
      targetAudience:
        'Entrepreneurs, freelancers, shop owners, and working professionals aged 22–45 interested in Vastu, crystals, and daily confidence rituals who worry about fake glass beads online.',
      mainOffer: 'Free "Find Your Stone" Match + Combo Savings + Cash on Delivery across India',
      emotionTone: 'Emotional',
      adGoal: 'sales',
      preferredStyle: 'Problem-Solution',
      language: 'hinglish',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'rudrasacred-rudraksha',
    niche: 'Rudra Sacred · Rudraksha',
    title: 'Authentic 1–14 Mukhi & Gauri Shankar Rudraksha — rudrasacred.in',
    summary: 'Myth-busting Hindi UGC story helping buyers choose the right Mukhi Rudraksha without confusion.',
    brief: {
      productName: 'Rudra Sacred Certified Nepali Rudraksha (1–14 Mukhi)',
      productDescription:
        'Authentic Rudraksha beads (5 Mukhi, 7 Mukhi, Gauri Shankar) from rudrasacred.in with guided "Help Me Choose" selector so first-time buyers pick the right bead for peace, career, or family harmony.',
      targetAudience:
        'Devotees and spiritual seekers aged 25–55 confused by duplicate market Rudrakshas and unsure which Mukhi suits their birth details.',
      mainOffer: 'Guided Stone/Rudraksha Finder + COD Available + 7-Day Return Policy',
      emotionTone: 'Trustworthy',
      adGoal: 'sales',
      preferredStyle: 'Storytelling',
      language: 'hindi',
      videoLength: '45s',
      scriptCount: 4,
    },
  },
  {
    id: 'astrosacred-jyotish-bundle',
    niche: 'Astro Sacred · Digital Bundle',
    title: '400+ Jyotish E-Books & Upay Pitara Library — astrosacred.store',
    summary: 'High-converting direct-response Hindi UGC ad for astrology learners and remedy seekers.',
    brief: {
      productName: 'Astro Sacred 400+ Jyotish E-Books & The Upay Pitara',
      productDescription:
        'Instant-download organized digital library from astrosacred.store featuring 400+ classic Jyotish, Lal Kitab, Vastu, and practical Upay Pitara remedy ebooks for self-study.',
      targetAudience:
        'Astrology learners, Jyotish enthusiasts, and Vastu students aged 22–55 across India tired of scattered PDFs and expensive fragmented courses.',
      mainOffer: 'All-in-One Digital Bundle + Instant Download After Payment (UPI / Card)',
      emotionTone: 'FOMO',
      adGoal: 'sales',
      preferredStyle: 'Talking Head',
      language: 'hindi',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'astrosacred-kundli-report',
    niche: 'Astro Sacred · Personalized PDF',
    title: 'Personalized Birth Chart & Remedy PDF Report — astrosacred.store',
    summary: 'Empathetic Hinglish UGC storytelling ad for custom birth-detail PDF reports delivered via email.',
    brief: {
      productName: 'Astro Sacred Personalized Birth Chart & Remedy PDF Report',
      productDescription:
        'Custom, deeply calculated Vedic astrology PDF report from astrosacred.store based on exact date, time, and place of birth — covering career, marriage timing, doshas, and practical self-study remedies delivered straight to email.',
      targetAudience:
        'Young professionals and families aged 22–42 facing career blocks or relationship confusion who want clear birth-chart insights without paying ₹2000+ for live calls.',
      mainOffer: 'Custom Calculated PDF Delivered to Your Email + Bonus Remedy Guide',
      emotionTone: 'Empathetic',
      adGoal: 'sales',
      preferredStyle: 'Storytelling',
      language: 'hinglish',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'astrosacred-vastu-healing',
    niche: 'Astro Sacred · Vastu & Healing',
    title: 'Ultimate Vastu Master Bundle & Sacred Healing Library — astrosacred.store',
    summary: 'Before-After home energy & study clarity UGC ad for homeowners and practitioners.',
    brief: {
      productName: 'Astro Sacred Ultimate Vastu & Sacred Healing Library',
      productDescription:
        'Complete digital collection of practical home/office Vastu correction guides and crystal/energy healing ebooks from astrosacred.store for instant download.',
      targetAudience:
        'Homeowners, small business owners, and holistic healers aged 26–50 wanting practical, non-demolition Vastu fixes and organized healing references.',
      mainOffer: 'Instant Access Bundle + Lifetime Digital Library Ownership',
      emotionTone: 'Authority',
      adGoal: 'sales',
      preferredStyle: 'Before-After',
      language: 'english',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'ecom-posture',
    niche: 'E-Commerce',
    title: 'Magnetic Posture & Back Support Belt',
    summary: 'Physical problem-solver gadget for desk workers & commuters with COD offer.',
    brief: {
      productName: 'AeroSpine Posture Pro',
      productDescription:
        'Breathable, lightweight adjustable posture corrector worn invisibly under shirts or kurtas to relieve upper back and neck stiffness during long laptop or bike rides.',
      targetAudience:
        'Men and women aged 22–42 working desk jobs, university students, and daily commuters suffering from slouching and neck/shoulder pain.',
      mainOffer: 'Flat 35% Launch Discount + Free Home Delivery + Cash on Delivery',
      emotionTone: 'Empathetic',
      adGoal: 'sales',
      preferredStyle: 'Problem-Solution',
      language: 'hinglish',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'beauty-serum',
    niche: 'Beauty & Skincare',
    title: 'Rice Water + Niacinamide Glow Serum',
    summary: 'Authentic bathroom-mirror UGC skincare review targeting humid weather dullness.',
    brief: {
      productName: 'PureDew Rice & Niacinamide 5% Serum',
      productDescription:
        'Lightweight, non-sticky brightening serum formulated for humid weather. Reduces dark spots, excess oil, and uneven skin tone within 14 days without irritation.',
      targetAudience:
        'Women aged 19–34 looking for authentic, non-greasy skincare that handles summer heat, dust, and post-acne marks without harsh chemicals.',
      mainOffer: 'Buy 1 Get 1 Mini Cleanser Free + 100% Authentic Barcode Verification',
      emotionTone: 'Trustworthy',
      adGoal: 'sales',
      preferredStyle: 'UGC',
      language: 'hinglish',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'course-meta-ads',
    niche: 'Courses & EdTech',
    title: 'Performance Marketing & Meta Ads Cohort',
    summary: 'Authority + student transformation storytelling ad for lead generation.',
    brief: {
      productName: 'ScaleLab Meta Ads Mastery (8-Week Live Cohort)',
      productDescription:
        'Hands-on live training teaching D2C owners and aspiring freelancers how to build winning UGC creatives, fix high CPMs, and scale profitable Meta campaigns.',
      targetAudience:
        'Young graduates, freelancers, and small D2C store owners aged 20–35 tired of boosting posts randomly and losing ad budget without real ROAS.',
      mainOffer: 'Early Bird 40% Fee Waiver + 1-on-1 Ad Account Audit + Recording Access',
      emotionTone: 'Authority',
      adGoal: 'leads',
      preferredStyle: 'Talking Head',
      language: 'hinglish',
      videoLength: '45s',
      scriptCount: 4,
    },
  },
  {
    id: 'saas-fcommerce',
    niche: 'SaaS & App',
    title: 'OrderFlow — D2C Order & Courier Sync',
    summary: 'POV founder frustration hook showing instant automated shipping booking.',
    brief: {
      productName: 'OrderFlow Studio',
      productDescription:
        'All-in-one web dashboard that auto-syncs WhatsApp & Instagram orders, flags high-RTO numbers, prints thermal labels, and books Shiprocket/Delhivery pickups in one click.',
      targetAudience:
        'Online shop owners and small D2C teams handling 20–300 daily orders via messy spreadsheets and facing high COD return rates.',
      mainOffer: '14-Day Free Trial (No Card Needed) + 500 Free Courier Bookings',
      emotionTone: 'FOMO',
      adGoal: 'leads',
      preferredStyle: 'Before-After',
      language: 'english',
      videoLength: '30s',
      scriptCount: 4,
    },
  },
  {
    id: 'local-dental',
    niche: 'Local Business',
    title: 'ClearAlign Smile Studio',
    summary: 'Patient testimonial & clinic walkthrough for local consultation bookings.',
    brief: {
      productName: 'ClearAlign Smile Studio — Invisible Aligners',
      productDescription:
        'Pain-free, nearly invisible custom teeth aligners and laser scaling with 3D digital smile preview before starting treatment.',
      targetAudience:
        'Young professionals and brides/grooms-to-be aged 22–38 who avoid metal braces because of awkward photos and office meetings.',
      mainOffer: 'Free 3D Smile Scan & Consultation This Week + 0% EMI Plan',
      emotionTone: 'Conversational',
      adGoal: 'leads',
      preferredStyle: 'Testimonial',
      language: 'hinglish',
      videoLength: '30s',
      scriptCount: 3,
    },
  },
  {
    id: 'health-immunity',
    niche: 'Health & Wellness',
    title: 'Raw Forest Honey & Black Seed Blend',
    summary: 'Trust-first family storytelling ad highlighting purity lab test and daily energy.',
    brief: {
      productName: 'NatureRoot Raw Forest Honey & Kalonji Blend',
      productDescription:
        'Unheated, lab-tested raw forest honey infused with cold-pressed organic black seed extract for morning immunity, digestion, and sustained energy.',
      targetAudience:
        'Health-conscious parents and busy professionals aged 28–55 worried about adulterated market honey and frequent seasonal fatigue.',
      mainOffer: '2-Jar Family Combo Save 25% + Money-Back Purity Guarantee',
      emotionTone: 'Trustworthy',
      adGoal: 'sales',
      preferredStyle: 'Storytelling',
      language: 'hindi',
      videoLength: '45s',
      scriptCount: 4,
    },
  },
];

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'young-female-ugc',
    label: 'Young Female · Energetic UGC',
    description: 'Bright, fast-paced, relatable Gen-Z/Millennial creator talking to camera like a friend.',
    voiceName: 'Kore',
    stylePrompt:
      'Young woman in her early 20s, warm and energetic creator tone, conversational pacing with natural emphasis on hooks and excitement on product reveal.',
  },
  {
    id: 'energetic-male-hook',
    label: 'Energetic Male · Fast Hook',
    description: 'Punchy, confident male creator with crisp articulation for Reels retention.',
    voiceName: 'Puck',
    stylePrompt:
      'Energetic male creator in his mid 20s, upbeat, punchy rhythm, direct eye-contact delivery with slightly urgent emphasis on problem and CTA.',
  },
  {
    id: 'calm-trustworthy',
    label: 'Calm Trustworthy · Founder',
    description: 'Grounded, reassuring expert voice ideal for skincare, health, or SaaS.',
    voiceName: 'Zephyr',
    stylePrompt:
      'Calm, articulate, trustworthy founder tone, steady medium pace, empathetic on pain points and confident without sounding pushy.',
  },
  {
    id: 'deep-authority',
    label: 'Deep Authority · Direct Response',
    description: 'Bold, clear studio narration for high-ticket offers, courses, and tech.',
    voiceName: 'Charon',
    stylePrompt:
      'Deep, authoritative yet modern narrator voice, crisp pauses before key statistics and clear, decisive call to action.',
  },
  {
    id: 'bold-urgent',
    label: 'Urgent Hype · Flash Offer',
    description: 'High-energy scroll-stopper delivery for limited-time promos and FOMO hooks.',
    voiceName: 'Fenrir',
    stylePrompt:
      'Bold, expressive, urgent delivery with dynamic pitch shifts to stop scrolling in the first 3 seconds.',
  },
];
