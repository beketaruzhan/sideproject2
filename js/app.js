/**
 * Minerva Admissions Roadmap — Application Logic
 */

const MILESTONE_DEFS = [
    { daysBefore: 45, title: "Outreach Phase", desc: "Email counselor for transcripts and request feedback from recommenders." },
    { daysBefore: 35, title: "The Evidence Audit", desc: "Gather photos, certificates, and links. Convert .arw/.hif files to .jpg." },
    { daysBefore: 25, title: "Accomplishment Drafts", desc: "Write the first version of your 6 major accomplishments." },
    { daysBefore: 15, title: "Feedback Loop", desc: "Share drafts with a mentor/teacher to get final feedback." },
    { daysBefore: 7, title: "The Narrative Polish", desc: "Final proofreading and character count optimization for all essays." },
    { daysBefore: 3, title: "Evidence Upload", desc: "Finalize all uploads to the application portal and check for errors." },
    { daysBefore: 2, title: "The Submission Buffer", desc: "Submit now! Avoid last-minute server crashes and technical glitches." }
];

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // Get elements inside the loader to ensure they exist
    const targetDateInput = document.getElementById('targetDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const timelineContainer = document.getElementById('timeline');
    const roadmapSection = document.getElementById('roadmapContainer');
    const emptyState = document.getElementById('emptyState');
    const exportBtn = document.getElementById('exportIcs');

    if (!calculateBtn) {
        console.error("Critical Error: Calculate button not found in DOM");
        return;
    }

    /**
     * INITIALIZATION: Load saved data
     */
    try {
        const savedDate = localStorage.getItem('minervaTargetDate');
        if (savedDate) {
            console.log("Found saved date:", savedDate);
            targetDateInput.value = savedDate;
            generateRoadmap(new Date(savedDate));
        }
    } catch (e) {
        console.error("Initialization error:", e);
    }

    /**
     * CLICK HANDLER
     */
    calculateBtn.addEventListener('click', () => {
        const selectedDateValue = targetDateInput.value;
        console.log("Button clicked. Date value:", selectedDateValue);
        
        if (!selectedDateValue) {
            alert("Please select a target deadline first!");
            return;
        }

        try {
            // Force local time parsing to avoid timezone shifts
            const dateParts = selectedDateValue.split('-');
            const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            
            if (isNaN(targetDate.getTime())) {
                throw new Error("Invalid date object created");
            }
            
            localStorage.setItem('minervaTargetDate', selectedDateValue);
            generateRoadmap(targetDate);
        } catch (e) {
            console.error("Generation error:", e);
            alert("Error: " + e.message);
        }
    });

    function generateRoadmap(targetDate) {
        console.log("Generating roadmap for:", targetDate);
        
        timelineContainer.innerHTML = '';
        roadmapSection.classList.remove('hidden');
        emptyState.classList.add('hidden');

        MILESTONE_DEFS.forEach((milestone, index) => {
            const milestoneDate = new Date(targetDate);
            milestoneDate.setDate(targetDate.getDate() - milestone.daysBefore);
            
            const dateString = milestoneDate.toLocaleDateString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });

            const milestoneEl = document.createElement('div');
            milestoneEl.className = 'relative pl-8 animate-fade-in';
            milestoneEl.style.animationDelay = `${index * 100}ms`;
            
            milestoneEl.innerHTML = `
                <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-minerva-blue border-4 border-blue-100"></div>
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

        roadmapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * EXPORT LOGIC
     */
    exportBtn.addEventListener('click', () => {
        const targetDateValue = targetDateInput.value;
        if (!targetDateValue) return;

        const dateParts = targetDateValue.split('-');
        const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

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
            const dateStr = mDate.toISOString().split('T')[0].replace(/-/g, '');
            
            icsContent.push("BEGIN:VEVENT");
            icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
            icsContent.push(`DTEND;VALUE=DATE:${dateStr}`);
            icsContent.push(`SUMMARY:Minerva: ${milestone.title}`);
            icsContent.push(`DESCRIPTION:${milestone.desc}`);
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
});
