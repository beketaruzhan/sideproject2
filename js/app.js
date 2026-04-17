/**
 * Minerva Admissions Roadmap — Application Logic
 * 
 * This script handles:
 * 1. Date calculations backwards from a target deadline.
 * 2. Dynamic UI rendering of the roadmap timeline.
 * 3. LocalStorage persistence for user data.
 * 4. .ics calendar file generation for export.
 */

// 1. CONFIGURATION: Defining the strategic milestones
const MILESTONE_DEFS = [
    { daysBefore: 45, title: "Outreach Phase", desc: "Email counselor for transcripts and request feedback from recommenders." },
    { daysBefore: 35, title: "The Evidence Audit", desc: "Gather photos, certificates, and links. Convert .arw/.hif files to .jpg." },
    { daysBefore: 25, title: "Accomplishment Drafts", desc: "Write the first version of your 6 major accomplishments." },
    { daysBefore: 15, title: "Feedback Loop", desc: "Share drafts with a mentor/teacher to get final feedback." },
    { daysBefore: 7, title: "The Narrative Polish", desc: "Final proofreading and character count optimization for all essays." },
    { daysBefore: 3, title: "Evidence Upload", desc: "Finalize all uploads to the application portal and check for errors." },
    { daysBefore: 2, title: "The Submission Buffer", desc: "Submit now! Avoid last-minute server crashes and technical glitches." }
];

// DOM Elements
const targetDateInput = document.getElementById('targetDate');
const calculateBtn = document.getElementById('calculateBtn');
const timelineContainer = document.getElementById('timeline');
const roadmapSection = document.getElementById('roadmapContainer');
const emptyState = document.getElementById('emptyState');
const exportBtn = document.getElementById('exportIcs');

/**
 * INITIALIZATION: Load saved data from LocalStorage
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("App initialized");
    try {
        const savedDate = localStorage.getItem('minervaTargetDate');
        if (savedDate) {
            console.log("Found saved date:", savedDate);
            targetDateInput.value = savedDate;
            generateRoadmap(new Date(savedDate));
        }
    } catch (e) {
        console.error("Error during initialization:", e);
    }
});

/**
 * CORE LOGIC: Calculating dates and rendering the UI
 */
calculateBtn.addEventListener('click', () => {
    const selectedDateValue = targetDateInput.value;
    console.log("Calculate clicked. Selected date:", selectedDateValue);
    
    if (!selectedDateValue) {
        alert("Please select a target deadline first!");
        return;
    }

    try {
        const targetDate = new Date(selectedDateValue);
        if (isNaN(targetDate.getTime())) {
            throw new Error("Invalid date selected");
        }
        
        // Save to LocalStorage for persistence
        localStorage.setItem('minervaTargetDate', selectedDateValue);
        
        generateRoadmap(targetDate);
    } catch (e) {
        console.error("Error generating roadmap:", e);
        alert("There was an error calculating your roadmap. Please try selecting the date again.");
    }
});

function generateRoadmap(targetDate) {
    // Clear previous timeline
    timelineContainer.innerHTML = '';
    
    // Show roadmap section, hide empty state
    roadmapSection.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Create each milestone element
    MILESTONE_DEFS.forEach((milestone, index) => {
        const milestoneDate = new Date(targetDate);
        milestoneDate.setDate(targetDate.getDate() - milestone.daysBefore);
        
        const dateString = milestoneDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });

        const milestoneEl = document.createElement('div');
        milestoneEl.className = 'relative pl-8 animate-fade-in';
        milestoneEl.style.animationDelay = `${index * 100}ms`;
        
        milestoneEl.innerHTML = `
            <!-- Timeline Dot -->
            <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-minerva-blue border-4 border-blue-100"></div>
            
            <!-- Content -->
            <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-blue-300 transition-colors">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                    <span class="text-xs font-bold uppercase tracking-wider text-blue-600">T-${milestone.daysBefore} Days</span>
                    <span class="text-sm font-medium text-gray-500">${dateString}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">${milestone.title}</h3>
                <p class="text-gray-600 text-sm leading-relaxed">${milestone.desc}</p>
            </div>
        `;
        
        timelineContainer.appendChild(milestoneEl);
    });

    // Scroll to the roadmap
    roadmapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * EXPORT LOGIC: Generating an .ics file
 * Why: This allows students to sync their roadmap with Google Calendar/iCal easily.
 */
exportBtn.addEventListener('click', () => {
    const targetDate = new Date(targetDateInput.value);
    let icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Minerva Admissions Roadmap//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ];

    MILESTONE_DEFS.forEach(milestone => {
        const mDate = new Date(targetDate);
        mDate.setDate(targetDate.getDate() - milestone.daysBefore);
        
        // Format date as YYYYMMDD
        const dateStr = mDate.toISOString().split('T')[0].replace(/-/g, '');
        
        icsContent.push("BEGIN:VEVENT");
        icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
        icsContent.push(`DTEND;VALUE=DATE:${dateStr}`);
        icsContent.push(`SUMMARY:Minerva: ${milestone.title}`);
        icsContent.push(`DESCRIPTION:${milestone.desc}`);
        icsContent.push("STATUS:CONFIRMED");
        icsContent.push("TRANSP:TRANSPARENT");
        icsContent.push("END:VEVENT");
    });

    icsContent.push("END:VCALENDAR");

    const blob = new Blob([icsContent.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Minerva_Roadmap.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
