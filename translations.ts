import { Language } from './types';

export const TRANSLATIONS = {
  HINGLISH: {
    // Auth
    app_tagline: "Bas padho, baaki PadhoYaar sambhaal lega.",
    login_btn: "Google se shuru karein",
    login_disclaimer: "Aage badhne ka matlab hai aap serious hain.",

    // Onboarding
    setup_title: "Chalo shuru karte hain",
    setup_subtitle: "UPSC ki taiyaari ko aasaan banate hain.",
    label_year: "Target Year",
    label_optional: "Optional Subject",
    label_hours: "Roz kitna padhoge? (Ghante)",
    label_stage: "Exam Stage (Abhi kya padh rahe ho?)",
    mode_self: "Self Study",
    mode_self_desc: "Main khud padhta hoon",
    mode_coaching: "Coaching",
    mode_coaching_desc: "Meri classes hoti hain",
    label_language: "Bhaasha (Language)",
    start_btn: "Mission Shuru Karein",

    // Today
    today_title: "Aaj ka Target",
    stats_pending: "Baaki hai",
    stats_done: "Ho gaya",
    section_todo: "Abhi karna hai",
    section_completed: "Poora hua",
    btn_skip: "Chhodo",
    btn_start: "Shuru karo",
    btn_done: "Ho gaya",
    btn_generate: "Plan Banayein",
    btn_regenerate: "Naya Plan Banayein",
    empty_tasks: "Aaj ka koi plan nahi hai abhi.",
    generating: "Aapka plan ban raha hai...",
    focus_mode: "Focus Mode",
    btn_give_up: "Abhi nahi hoga",
    btn_finish_early: "Jaldi khatam",
    confirm_regen: "Kya aap naya plan banana chahte hain? Purane pending tasks hatt jayenge.",

    // Features (Signals/Modes)
    mode_prelims: "Mode: Prelims",
    mode_mains: "Mode: Mains",
    mode_final: "Mode: Final",
    signal_high: "Is topic se pehle sawal aa chuka hai (High Yield)",
    signal_med: "Ye topic zaroori hai",
    signal_low: "Sirf ek baar padh lo",
    guard_restart: "Koi baat nahi, restart karna allowed hai.",
    ans_tracker_q: "Perfect nahi, bas likha?",

    // Custom Plan Feature
    cust_title: "Apna Plan Choose Karein",
    cust_opt_guided: "PadhoYaar Suggest Kare (Recommended)",
    cust_opt_guided_desc: "Best for beginners. Hum aapka load manage karenge.",
    cust_opt_custom: "Main khud plan banana chahta hoon",
    cust_opt_custom_desc: "Agar aapko pata hai aapko kya chahiye.",

    cust_step1_q: "Roz ka structure kaisa chahiye?",
    cust_struct_rot: "Ek ke baad ek (Static Rotation)",
    cust_struct_mix: "Roz thoda sabkuch (Mixed Daily)",
    cust_struct_focus: "Ek subject par focus (Single Subject)",

    cust_step2_q: "Roz kitne bade tasks comfortable hain?",
    cust_limit_desc: "Chinta mat karo, revision alag se count hoga.",

    cust_step3_q: "Revision ka style kya ho?",
    cust_rev_daily: "Roz thoda-thoda (Daily Light)",
    cust_rev_alt: "Ek din chhod ke (Alternate Days)",
    cust_rev_light: "Halke din allowed hain (Light Days)",

    cust_step4_q: "Answer writing ka pace?",
    cust_aw_daily: "Roz 1 answer (Daily)",
    cust_aw_alt: "Har doosre din (Alternate)",
    cust_aw_week: "Sirf Weekends (Prelims Mode)",

    cust_reality_check: "Ye thoda heavy lag raha hai. Kya aap sure hain?",
    cust_reality_sub: "Aapka daily goal kam hai par tasks zyada hain.",
    cust_btn_adjust: "Adjust Plan",
    cust_btn_save: "Save & Lock Plan",
    cust_lock_msg: "Plan saved! Ab 7 din tak edit locked rahega taaki aap consistency maintain karein.",
    cust_active_banner: "Custom Plan Active",
    cust_unlock_date: "Unlock date:",

    // Revision
    rev_title: "Revision Engine",
    rev_subtitle: "Bhoolne ki bimari ka ilaaj.",
    rev_due: "Aaj revise karo",
    rev_upcoming: "Aane wale topics",
    rev_empty: "Sab badhiya! Aaj kuch revise nahi karna.",
    rev_overdue: "Late ho gaya",
    rev_stage: "Level",
    rev_upcoming_empty: "Roz padhai karo, tabhi yahan topics aayenge.",

    // Progress
    prog_title: "Aapki Progress",
    prog_subtitle: "Roz padhna zaroori hai.",
    prog_score: "Consistency Score",
    prog_total: "Kul Tasks",
    prog_crushed: "Tasks Poore Kiye",
    prog_chart_title: "Pichle 7 din ka haal",
    prog_radar_title: "UPSC Readiness Radar",
    prog_radar_sub: "Agar exam aaj hota, aap yahan hain",

    // Settings
    set_title: "Settings",
    sub_title: "Subscription Plan",
    set_sub_active: "Free Trial (15 Days) Active",
    set_sub_exp: "15 din mein expire hoga",
    set_upgrade: "Pro plan lein (₹99/mo)",
    set_cust_plan: "Plan Customize Karein",
    set_logout: "Logout",

    // Nav
    nav_today: "Aaj",
    nav_revision: "Revise",
    nav_progress: "Progress",
    nav_profile: "Profile"
  },

  EN: {
    // Auth
    app_tagline: "Just study, PadhoYaar handles the rest.",
    login_btn: "Continue with Google",
    login_disclaimer: "By continuing, you agree to focus hard.",

    // Onboarding
    setup_title: "Let's setup your war room",
    setup_subtitle: "Tailoring your experience for UPSC.",
    label_year: "Target Year",
    label_optional: "Optional Subject",
    label_hours: "Daily Study Goal (Hours)",
    label_stage: "Exam Stage",
    mode_self: "Self Study",
    mode_self_desc: "I manage my own time",
    mode_coaching: "Coaching",
    mode_coaching_desc: "I have classes",
    label_language: "Language",
    start_btn: "Start Mission",

    // Today
    today_title: "Today's Mission",
    stats_pending: "Pending",
    stats_done: "Done",
    section_todo: "To Do",
    section_completed: "Completed",
    btn_skip: "Skip",
    btn_start: "Start",
    btn_done: "Done",
    btn_generate: "Generate Plan",
    btn_regenerate: "Regenerate Plan",
    empty_tasks: "No tasks for today yet.",
    generating: "Generating Study Plan...",
    focus_mode: "Focus Mode",
    btn_give_up: "Give Up",
    btn_finish_early: "Finish Early",
    confirm_regen: "Do you want to regenerate the plan? Pending tasks for today will be removed.",

    // Features
    mode_prelims: "Mode: Prelims",
    mode_mains: "Mode: Mains",
    mode_final: "Mode: Final (Interview)",
    signal_high: "Questions have appeared from this topic (High Yield)",
    signal_med: "This topic is important",
    signal_low: "Read just once",
    guard_restart: "It's okay. Restarting is allowed.",
    ans_tracker_q: "Not perfect, but did you write?",

    // Custom Plan
    cust_title: "Choose Your Plan",
    cust_opt_guided: "PadhoYaar Suggests (Recommended)",
    cust_opt_guided_desc: "Best for beginners. We manage the load.",
    cust_opt_custom: "I want to build my own",
    cust_opt_custom_desc: "If you know exactly what you need.",

    cust_step1_q: "Daily Structure?",
    cust_struct_rot: "Sequential (Static Rotation)",
    cust_struct_mix: "Mix of everything (Mixed Daily)",
    cust_struct_focus: "Single Subject Focus",

    cust_step2_q: "How many big tasks per day?",
    cust_limit_desc: "Don't worry, revision is counted separately.",

    cust_step3_q: "Revision Style?",
    cust_rev_daily: "Daily Light",
    cust_rev_alt: "Alternate Days",
    cust_rev_light: "Light Days Allowed",

    cust_step4_q: "Answer Writing Pace?",
    cust_aw_daily: "Daily (1 Answer)",
    cust_aw_alt: "Alternate Days",
    cust_aw_week: "Weekends Only",

    cust_reality_check: "This looks heavy. Are you sure?",
    cust_reality_sub: "Your daily goal is low but tasks are high.",
    cust_btn_adjust: "Adjust Plan",
    cust_btn_save: "Save & Lock Plan",
    cust_lock_msg: "Plan saved! Editing is locked for 7 days to ensure consistency.",
    cust_active_banner: "Custom Plan Active",
    cust_unlock_date: "Unlocks on:",

    // Revision
    rev_title: "Revision Engine",
    rev_subtitle: "Spaced repetition to beat the forgetting curve.",
    rev_due: "Due Today",
    rev_upcoming: "Upcoming",
    rev_empty: "All caught up!",
    rev_overdue: "Overdue",
    rev_stage: "Stage",
    rev_upcoming_empty: "Complete daily study tasks to add items here.",

    // Progress
    prog_title: "Your Progress",
    prog_subtitle: "Consistency > Intensity",
    prog_score: "Consistency Score",
    prog_total: "Total Tasks",
    prog_crushed: "Tasks Crushed",
    prog_chart_title: "Last 7 Days Activity",
    prog_radar_title: "UPSC Readiness Radar",
    prog_radar_sub: "If exam was today, here is where you stand",

    // Settings
    set_title: "Settings",
    sub_title: "Subscription Plan",
    set_sub_active: "Free Trial (15 Days) Active",
    set_sub_exp: "Expires in 15 days",
    set_upgrade: "Upgrade to Pro (₹99/mo)",
    set_cust_plan: "Customize Plan",
    set_logout: "Logout",

    // Nav
    nav_today: "Today",
    nav_revision: "Revision",
    nav_progress: "Progress",
    nav_profile: "Profile"
  },

  // Minimal Fallbacks for other languages to prevent crashes
  HI: {
    // ... existing ...
    cust_title: "अपना प्लान चुनें",
    cust_active_banner: "कस्टम प्लान सक्रिय",
    set_cust_plan: "प्लान कस्टमाइज़ करें"
  }
};


export type TranslationKey = keyof typeof TRANSLATIONS.EN;

export const tSafe = (
  lang: keyof typeof TRANSLATIONS,
  key: TranslationKey
) =>
  TRANSLATIONS[lang]?.[key] ??
  TRANSLATIONS.EN[key] ??
  key;
