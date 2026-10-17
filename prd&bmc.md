Marine Heatwaves Education Platform: PRD and Business Model Canvas
Working title: [to be chosen]. Hackathon project for Cecema, part of the Valerian Project. Status: draft v2 for team review. Repositioned: a French-first observatory, more readable than existing tools, serving the public and scientists at once.
Everything marked (hypothesis) is an assumption to validate with a teacher, a museum mediator or a scientist before the pitch. Everything marked (verify) is a fact to check against an official source.

Part 1. Product Requirements Document
1. Vision
A French-first observatory that makes marine heatwaves readable for everyone and credible for scientists. One engine on real Copernicus data, three depths of reading (Découvrir, Explorer, Expert), and a clear ambition: be easier to use than the existing tools, not just different.
One-line pitch: "See in seconds whether your coast is in a marine heatwave, understand why, and go as deep as you want, in French."
2. Problem and opportunity
    • Marine heatwaves are intensifying on French coasts. In August 2026 the Gulf of Lion showed anomalies of about 6 °C above average (Copernicus), and in June 2025 62% of the Mediterranean surface was in a heatwave (Mercator). Thau mussel farmers reported 100% mortality in summer 2026 (AFP). (verify figures against the sources before the pitch)
    • The data exists but is hard to read. Existing Copernicus-based viewers are built for experts and mostly in English; a non-specialist struggles to answer "did my coast have a heatwave last summer?" (hypothesis, to prove with the benchmark in section 4.2)
    • In French, our search found press articles and static maps but no interactive tool to explore events. (to confirm: one search is not an audit)
    • Teachers and museum mediators have few ready-to-use, data-driven resources on this topic in French. (hypothesis, to validate with 3 to 5 teachers and 1 museum)
    • Opportunity: one tool, on real open data, clearly more readable than the alternatives, that serves the public and scientists at once.
3. Goals and non-goals
Goals
    1. Be clearly more readable than existing tools: a non-expert answers "did my coast have a marine heatwave last summer?" in under 30 seconds, measured against 2 or 3 existing tools (target is a hypothesis).
    2. French-first: interface, glossary and content in French, English second.
    3. One engine, three depths (Découvrir, Explorer, Expert), so the same map serves the public, teachers and scientists.
    4. Give teachers a tool they can use in class with minimal preparation.
    5. Keep every number on screen traceable to real data or a cited source, with limits stated plainly.
Non-goals (for the hackathon and v1)
    • Producing an operational forecast or early-warning service.
    • Building our own ocean model.
    • Farm-level or lagoon-level prediction (satellite resolution is too coarse; stated openly in the product).
    • User accounts for minors beyond what is strictly necessary (privacy first).
4. Target users
Persona	Who they are	What they need	Depth	Priority
Student (11 to 18)	Learner, in class or at home	Short, visual, interactive, mobile friendly, a sense of agency	Découvrir	Primary
Teacher	Middle or high school teacher (life sciences, geography, physics, civic education)	Ready-to-use activities aligned with the curriculum, works on school hardware, prep time under 15 minutes	Découvrir, Explorer	Primary
Scientist or higher-education student	Researcher, lab member, engineering or oceanography student	Transparent method, adjustable heatwave definition, numeric values, export, citable sources	Expert	Primary
Curious public	Coastal residents, divers, sailors, families	"What is happening to my sea?" answered in French, in seconds, shareable	Découvrir	Primary
Museum or aquarium mediator	Exhibit designer or educator at a science centre, aquarium or marine park	Kiosk-ready, touch-friendly, auto-reset, attractive in a loop	Découvrir, Explorer	Secondary
Journalist or communicator	Regional press, science communicators	Clear visuals to embed, numbers they can cite	Explorer	Secondary
Local actors	NGOs, local authorities, communication teams	Visuals and embeddable content for awareness campaigns	Explorer	Tertiary
The hackathon demo should centre on one student, one teacher and one scientist, using the same map at different depths.
4.1 One engine, three depths
The same map and data serve every audience; only the amount of explanation and control changes. A switch on every screen lets users go deeper or simpler without losing their place.
Depth	Audience	What the user sees	What stays hidden
Découvrir	Students, public, museum visitors	One question per screen ("Is my coast in a marine heatwave?"), plain-language labels, guided story, "my coast"	Percentiles, baselines, raw values
Explorer	Teachers, journalists, curious users	Free time slider, event browser, comparisons, quizzes, shareable cards	Method settings, raw exports
Expert	Scientists, higher-education students	Definition lab (percentile, baseline, minimum duration, detrending), numeric values, CSV export, methods	Nothing: every parameter and limit is shown
4.2 How we will beat existing tools
"Better" is a claim we must be able to test. In the first hours, pick 2 or 3 existing tools (for example the Mediterranean monitoring service and a Copernicus viewer), give 5 non-scientists the same task on each, and compare. We report the result in the pitch.
Criterion	How we test it	Target (hypothesis)
Time to first answer	Task: "Did your beach have a marine heatwave last summer?" Time it	Under 30 seconds on our tool
Comprehension	Testers explain the map back in their own words	Most explain it correctly without help
Language	Check interface, legends and glossary	100% French, with plain-language legends
Scientific transparency	A scientist checks the methods page and Expert mode	Baseline, threshold, resolution and limits all visible
Mobile use	Run the same task on a phone	Task completed on a phone
Classroom readiness	A teacher reviews a lesson kit	Usable without extra preparation
5. User stories (core)
    • As a student, I want to pick my coastline and see how its warm-water events have changed since the satellite record began, so that the issue feels personal.
    • As a student, I want to follow a real event (for example summer 2022) step by step, so that I understand cause, spread and consequence.
    • As a student, I want to change weather conditions (sun, wind, starting temperature) and see the water react, so that I learn the mechanism by playing.
    • As a student, I want to see what a heatwave does to species like mussels or gorgonians, so that I understand why it matters.
    • As a teacher, I want a ready lesson with objectives, a worksheet and a quiz, so that I can use it tomorrow.
    • As a teacher, I want to run a class session with a simple code and see aggregate results without collecting student personal data.
    • As a museum mediator, I want a kiosk mode that resets itself and runs an attract loop, so that I can leave it unattended.
    • As a scientist, I want an expert mode where I can change the heatwave definition and see events change, so that I can trust the tool.
6. Feature set
Priority key: P0 = hackathon MVP, P1 = strong demo extra, P2 = roadmap after the hackathon.
6.0 Cross-cutting: depth modes and readability
These features carry the promise of being more readable than existing tools. They apply to every screen below.
ID	Feature	Description	Priority
M1	Depth switcher	Découvrir, Explorer and Expert toggle on every screen; keeps the current place and date when switching	P0
M2	One-question screens	The default view answers one question ("Is my coast in a marine heatwave?") with a plain verdict first, details after	P0
M3	Plain-language legend	Colour scale with words (normal, warm, very warm, exceptional) next to degrees; colour-blind-safe palette	P0
M4	French glossary on hover	Every technical term has a short French definition; one consistent vocabulary across the tool	P0
M5	Mode-aware explanations	The same event explained at three levels of detail	P1
M6	Current conditions	Latest conditions from the near-real-time product with the same plain verdict (depends on data access, verify)	P1
6.1 Explore
ID	Feature	Description	Priority
E1	Interactive heatmap	Map of the French coast with a time slider, daily sea surface temperature anomaly, play/pause, smooth transitions	P0
E2	Event tracking	Heatwaves detected as objects in space and time, with an ID, start, peak, end, area, intensity category; click an event to see its life	P0
E3	"Your coast" mode	Choose a location, see its warming barcode since 1982, its worst events and the number of heatwave days per year	P0
E4	Compare places or years	Split view: two coasts or two summers side by side	P1
E5	Sea and air together	Synced view of atmospheric and marine heatwaves for a chosen summer	P2
6.2 Learn
ID	Feature	Description	Priority
L1	Guided story: summer 2022	6 to 8 steps with narration, map states and one question per step; the air heats, the sea responds, the event spreads, the consequences	P0
L2	"Why does it happen?" sandbox	Sliders for sunshine, wind and starting temperature driving a simplified water-column model; clearly labelled as a toy model	P1
L3	Consequence cards	Species and activities (mussels, oysters, gorgonians, seagrass, fishing, tourism) with stress thresholds and real cases; each threshold sourced (verify each one)	P0
L4	Glossary and explainers	Short, illustrated definitions: anomaly, baseline, percentile, heatwave, malaïgue	P0
L5	What-if slider (+1 °C, +2 °C)	Shifts the observed record to show how heatwave days per year would change; labelled as an illustration, not a climate projection	P1
6.3 Play
ID	Feature	Description	Priority
P1	Role-play scenarios	"You are a shellfish farmer / dive centre owner / marine park manager": a heatwave unfolds from real data, the player makes decisions and sees consequences	P1
P2	Predict, then reveal	Students guess how a coast evolved over time, then the real data is shown; score and explanation	P0
P3	Quiz and challenges	Short quizzes per story step, badges for completed paths	P1
6.4 Teach
ID	Feature	Description	Priority
T1	Lesson kits	For each activity: learning objectives, duration, prerequisites, a printable worksheet and teacher notes	P0 (at least 2 kits)
T2	Class session code	Teacher creates a session, students join with a code and no personal data; the teacher sees anonymous aggregate results (quiz scores, common mistakes)	P1
T3	Difficulty levels	Simplified mode (younger students), standard mode, expert mode	P1
T4	Curriculum mapping	Table linking each activity to French programme themes and skills (verify against official programmes)	P1
T5	Teacher guide and FAQ	One-page guide, tips for 30-minute and 55-minute sessions	P0
6.5 Share and deploy
ID	Feature	Description	Priority
S1	Kiosk mode	Fullscreen, large touch targets, inactivity reset, attract loop, no external links	P1
S2	Shareable cards	Export an image of "my coast" with its key stats and a link	P1
S3	Embeddable widget	iframe version of a map or story for websites and museum pages	P2
S4	Multilingual	French and English first; architecture ready for more	P0 (FR) / P1 (EN)
S5	Offline-capable build	Local build with preloaded data for museums or schools with poor connectivity	P2
6.6 Expert layer
ID	Feature	Description	Priority
X1	Definition Lab	Adjust percentile threshold, baseline period, minimum duration and detrending; events update live	P1
X2	Data export	Download event tables and anomaly series as CSV	P1
X3	Methods page	Datasets used, versions, processing steps, known limits, how to cite	P0
7. Experience principles
    1. Personal first: start from a place the user cares about.
    2. Learn by doing: every concept is paired with an interaction.
    3. Real data, honest limits: never show a fake or illustrative value without labelling it.
    4. Short loops: the main experience works in 5 minutes; deeper paths are optional.
    5. Hope and agency: show consequences without leaving users feeling helpless; each path ends with understanding and possible actions.
8. Technical approach
8.1 Architecture overview
    1. Offline data pipeline (Python):
        ◦ Download sea surface temperature from the Copernicus Marine Service: the reprocessed series covering the satellite era, plus the near-real-time product for recent months such as summer 2026 (check how the two series join).
        ◦ Compute a daily climatology and anomalies per pixel with xarray.
        ◦ Detect marine heatwaves using the Hobday et al. definition, then label connected events in space and time (for example with scipy.ndimage.label).
        ◦ Export compact files: anomaly grids as binary arrays or tiles, event tables as JSON or Parquet, per-location time series.
    2. Static web front end:
        ◦ Map rendering with MapLibre and deck.gl (WebGL).
        ◦ A modern framework (React or Svelte) for the story, quiz and teacher screens.
        ◦ Data loaded as static files, so no heavy backend is needed.
    3. Light backend (optional, P1):
        ◦ Only for class sessions (anonymous codes and aggregate results); can be a small serverless function and database.
    4. Hosting: static hosting plus CDN; the kiosk or offline build ships the same files locally.
8.2 Scientific rigour
    • Use a clearly documented baseline period and percentile threshold, and say which.
    • State the spatial resolution of the data and what it means (coastal lagoons are not resolved).
    • Validate event detection on known events (for example summer 2022) and compare with published results.
    • Ask a Cecema scientist to review explanations, thresholds and the sandbox model before release.
    • Log every dataset with its source, version and licence.
8.3 Non-functional requirements
Area	Requirement
Performance	Runs on a school laptop or mid-range tablet; first map view under 5 seconds on a typical school connection; data files kept small through a limited region and period
Accessibility	Colour-blind-safe palettes, keyboard navigation, text alternatives, captions on any audio or video, target level WCAG 2.1 AA (verify)
Privacy	No accounts for students; no personal data collected; anonymous session codes only; compliance with GDPR and rules protecting minors (verify)
Reliability	Static assets, graceful degradation if a data file is missing, prepared fallback for demos
Maintainability	Open-source code, documented data pipeline that a new contributor can rerun
Localisation	All text in translation files, never hard-coded
9. Success metrics
Hackathon demo
    • A complete, working path: choose a coast, follow the 2022 story, answer a question, read a consequence card.
    • One real tracked event shown end to end.
    • A methods page that explains the data and its limits.
    • At least two lesson kits and a teacher guide.
    • A readability benchmark: at least 5 non-scientists tested on our tool and on 2 or 3 existing tools (section 4.2), with the results reported honestly. Feedback from real teachers or students.
After launch (hypothesis targets, to be calibrated)
    • Teachers who run a full session without support.
    • Share of students who complete the guided story.
    • Learning gain, measured with a short before and after question set.
    • Number of classes, museums or organisations using the tool.
    • Teacher satisfaction (simple score and open comments).
10. Hackathon plan (48 hours, team of 10)
Workstream	People	Deliverables
Data and detection	3	Data download, climatology, anomalies, event detection and tracking, exports
Map and interaction	2	Heatmap, slider, event view, "your coast" mode
Learning content and pedagogy	2	Story script, consequence cards, quiz questions, lesson kits, teacher guide
Design and UX	1	Visual identity, layouts, accessibility, kiosk layout
Pitch, validation and documentation	2	Teacher and mediator interviews, PRD and canvas upkeep, slides, demo script, methods page
Timeline
Block	Goal
Hours 0 to 4	Align on scope, choose region and period, set up repository, data access and design system; start teacher interviews
4 to 16	Data pipeline and first map; story script and cards drafted in parallel
16 to 28	Event tracking, "your coast", story mode integrated with the map
28 to 38	Quizzes, teacher kit, polish, accessibility pass
38 to 44	Testing with real users, bug fixing, methods page
44 to 48	Pitch rehearsal, recorded fallback demo, final submission
Rule: from hour 24 onwards, there is always a working end-to-end demo. New features only enter if they do not break it.
11. Risks and mitigations
Risk	Impact	Mitigation
Data download or processing takes too long	Delays the whole project	Start with one region and one summer; precompute early; keep a sample dataset in the repository
Scientific inaccuracy in simplified models or thresholds	Loss of credibility with Cecema	Label simplifications; source every threshold; get a scientist review before the pitch
Scope creep	Unfinished features	Strict P0 list; one story, one region, a few polished interactions
Content feels like a generic quiz	Weak differentiation	Keep real data and tracked events at the centre; add the expert layer
Satellite resolution too coarse for local claims	Misleading messaging	Say so in the product; talk about coasts and regions, not individual farms or lagoons
No real teacher input	Tool not adapted to class use	Interview teachers early; test the kit with real users
Privacy concerns about minors	Blocks school adoption	No accounts; anonymous codes; minimal data
Two audiences, one interface becomes cluttered	Neither audience is served	Depth switcher with strict rules (Découvrir shows no jargon, Expert hides nothing); test each depth separately
Existing tools are better than we think, or a French tool exists that we missed	The "better" claim collapses	Run the benchmark early; adjust the claim to what we can prove
Summer 2026 is not in the reprocessed series	Best story is missing	Check the near-real-time product and how it joins the historical series
12. Open questions
    1. What exactly does Cecema or the organisers expect as a deliverable and which data are allowed?
    2. Which region and which period give the best story with a manageable data size?
    3. Which age group do we target first (middle school or high school)?
    4. What is the official licence of the data and of any imagery we reuse?
    5. Who owns and maintains the tool after the hackathon?
    6. Which scientist can review our explanations?
    7. Which existing tools do we benchmark, and who are our 5 non-scientist testers?
    8. How does the near-real-time product join the reprocessed series, so that summer 2026 can be shown?

Part 2. Business Model Canvas
An educational tool has different economics from a commercial product. The canvas below aims for a financially sustainable public-interest tool: free for schools, funded by institutions and paid deployments elsewhere. All pricing and revenue assumptions are hypotheses to test.
Block	Content
Customer segments	1. Teachers and schools (middle and high school). 2. Scientists, labs and higher-education students who need a transparent, citable view (Cecema network). 3. Curious public: coastal residents, divers, sailors, families. 4. Museums, aquariums, science centres, marine parks. 5. Media and science communicators who embed maps and cite numbers. 6. Institutions and NGOs doing ocean awareness (regions, ports, foundations).
Value propositions	Public and students: the answer to "is my coast in a marine heatwave?" in seconds, in French, then a story to understand why. Teachers: a ready-to-use, curriculum-aligned lesson on real data, under 15 minutes of preparation. Scientists: a transparent method with adjustable definition, numeric values and export, in the same tool. Museums and media: a kiosk-ready or embeddable view that is clearer than existing viewers. All: one engine with three depths, so nobody is shown too little or too much.
Channels	Teacher networks and school resource portals (verify which), science museum and aquarium networks, Cecema and Valerian Project communication, regional and science media, scientific community networks, ocean awareness events, social media with shareable "my coast" cards, direct outreach to regional authorities.
Customer relationships	Free self-service for schools and the public; teacher guide and FAQ; feedback loop with teachers and scientists; dedicated onboarding for museums; seasonal updates (new events, new stories) as a reason to return.
Revenue streams	1. Grants and institutional funding (public ocean-literacy and science-education programmes, regional authorities, foundations), the most realistic base (hypothesis). 2. Museum and institution licences for kiosk deployment, customisation and support. 3. Sponsored or co-branded editions by coastal towns, ports or ocean-related organisations. 4. Editorial partnerships and embed licences for media (hypothesis). 5. Premium teacher extras (extended lesson packs, class analytics) if demand appears. 6. Training workshops for teachers and mediators. Core access for schools and the public stays free.
Key resources	Open satellite data (Copernicus), the detection and tracking pipeline, the interactive map engine, a French glossary and pedagogical content, benchmark results and user-test findings, scientific validation from Cecema and partners, brand and design system.
Key activities	Data refresh and processing (including near-real-time updates), event detection and validation, readability testing with non-scientists, content creation with teachers, front-end development and maintenance, partnership building, fundraising.
Key partners	Cecema and the Valerian Project (science and credibility), Copernicus Marine and other data providers, teachers and education authorities, museums, aquariums and marine parks, ocean-related NGOs and foundations, universities for learning-impact evaluation, regional and science media.
Cost structure	Development and design time (largest cost), user testing, hosting and data storage (low because data is static and open), French content production and translation, scientific review, outreach events, support for institutional clients.
Why this model can work
    • Core costs are low because the data is open and the front end is static.
    • The audience that benefits (schools, the public) does not need to pay, so adoption is not blocked by budgets.
    • Funding comes from parties with a stated interest in ocean literacy and climate awareness.
    • The same engine serves classrooms, museums, scientists and media, which spreads development cost.
    • Readability and French make the tool easy to adopt and to share, which is the main growth lever (hypothesis).
What we still need to test
    1. Is our tool measurably more readable than existing ones for non-scientists (the benchmark in section 4.2)?
    2. Would teachers actually use it, and what makes them come back?
    3. Do scientists find the Expert depth credible enough to cite?
    4. Do museums or media pay for a licence or customisation?
    5. Which funders have calls matching this topic (verify)?
    6. Is the tool credible enough for a scientific partner to endorse?

Part 3. Pitch narrative (for the jury)
    1. Hook: "In August 2026 the sea in the Gulf of Lion was about 6 °C above average. Can you tell, in 10 seconds, whether your beach was affected? Most people can't." (verify the figure)
    2. Problem: the data exists, but existing tools are built for experts and mostly in English, so the public, teachers and many scientists lose time reading them.
    3. Solution: a French-first observatory with one map, one question per screen and three depths (Découvrir, Explorer, Expert).
    4. Differentiation: more readable, tested against existing tools; heatwave events tracked with their story; "your coast" history since 1982; an Expert mode that lets scientists question the definition itself; ready-to-teach kits.
    5. Credibility: real Copernicus data, documented methods, honest limits, validation on known events and review by scientists.
    6. Impact and model: free for schools and the public, funded by institutions and by museum and media licences; one engine, several audiences.
    7. Ask: support from Cecema and the Valerian Project to refine the science and pilot with real classes and a scientific partner.
Demo script (3 minutes): open on the verdict for the user's coast in Découvrir mode, scrub through 40 years of warming, follow one real event with a question, read a consequence card, then switch to Expert and change the definition of a heatwave live. Close on the benchmark result.