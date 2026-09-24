import { t, type FieldRoadmap } from './types';

export const dataScience: FieldRoadmap = {
  slug: 'data-science-analytics',
  name: 'Data Science & Analytics',
  icon: 'chart',
  shortDescription: 'Python, cleaning, analysis, visualisation and a first machine learning model.',
  description:
    'A hands-on analytics track. You work with real datasets from the first week: clean them, describe them, visualise them, then model them and write the findings up for a non-technical reader.',
  skills: ['Python', 'Pandas', 'NumPy', 'Data cleaning', 'Statistics', 'Matplotlib', 'EDA', 'scikit-learn', 'Reporting'],
  evaluationCriteria: 'Correctness of analysis, clarity of code, quality of visualisations and how well the written findings match the data. The final project is scored on the full pipeline from raw data to conclusion.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and pass the final project review.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'Python for data',
      summary: 'The Python you actually need for analysis.',
      objectives: ['Work with lists, dicts and comprehensions', 'Read files into Python', 'Use NumPy arrays'],
      tasks: [
        t('Python basics set', 'Solve eight short problems covering loops, functions, dictionaries and comprehensions.', 'Build Python fluency.', 'Notebook (.ipynb) or .py file.'),
        t('Read and summarise a file', 'Load a CSV without Pandas, count rows, find unique values in one column and compute a mean.', 'Understand what libraries do for you.', 'Notebook with output.'),
        t('NumPy and Pandas intro', 'Load the same CSV with Pandas, then use head, info, describe, value_counts and basic indexing.', 'Get comfortable with DataFrames.', 'Notebook with output.', 15),
      ],
    },
    {
      title: 'Data cleaning',
      summary: 'Turn a messy dataset into an analysable one.',
      objectives: ['Handle missing values', 'Fix types and duplicates', 'Document every cleaning decision'],
      tasks: [
        t('Missing values', 'Profile missing values in the provided dataset and handle each column with a justified strategy.', 'Make defensible cleaning choices.', 'Notebook plus a short rationale.', 15),
        t('Types, duplicates and outliers', 'Fix data types, remove duplicates, standardise text categories and flag outliers.', 'Prepare data for analysis.', 'Notebook plus the cleaned CSV.', 20),
        t('Cleaning log', 'Write a cleaning log listing every change, the reason and how many rows it affected.', 'Make your work reproducible.', 'PDF or markdown.'),
      ],
    },
    {
      title: 'Analysis',
      summary: 'Describe the data and find what is actually going on.',
      objectives: ['Compute descriptive statistics', 'Group and aggregate', 'Identify trends'],
      tasks: [
        t('Descriptive statistics', 'Compute mean, median, mode, standard deviation and quartiles for every numeric column, and interpret two of them.', 'Describe a dataset numerically.', 'Notebook with interpretation.'),
        t('Group analysis', 'Use groupby to compare at least three categories on two metrics and explain the difference.', 'Compare segments.', 'Notebook with output.', 15),
        t('Trend analysis', 'Analyse a time or ordered dimension and describe the trend in plain language.', 'Read change over time.', 'Notebook plus a written finding.', 15),
      ],
    },
    {
      title: 'Visualisation',
      summary: 'Make charts that carry the finding, not just the data.',
      objectives: ['Choose the right chart type', 'Label charts properly', 'Build a small dashboard'],
      tasks: [
        t('Chart set', 'Produce six charts: distribution, comparison, composition, relationship, trend and ranking. Every chart needs a title, axis labels and units.', 'Match chart type to question.', 'Notebook plus exported images.', 20),
        t('Chart critique', 'Pick your two weakest charts, explain what is wrong and submit improved versions.', 'Develop visual judgement.', 'Before and after images plus notes.'),
        t('Mini dashboard', 'Combine four charts into a single dashboard layout with a short summary panel.', 'Present multiple views together.', 'Image or notebook export.', 20),
      ],
    },
    {
      title: 'Exploratory data analysis',
      summary: 'A full EDA on a dataset you choose.',
      objectives: ['Form and test hypotheses', 'Examine correlations', 'Summarise findings'],
      tasks: [
        t('Hypotheses', 'Write five questions you want the data to answer before you look.', 'Analyse with intent.', 'Document.'),
        t('Full EDA', 'Run the complete EDA: univariate, bivariate, correlation matrix and at least one segment deep-dive.', 'Explore systematically.', 'Notebook.', 25),
        t('Findings summary', 'Write a one-page summary of the five most useful findings for a non-technical reader.', 'Translate analysis into insight.', 'PDF.', 15),
      ],
    },
    {
      title: 'Machine learning basics',
      summary: 'Train, test and evaluate a first model.',
      objectives: ['Split data correctly', 'Train a baseline model', 'Evaluate honestly'],
      tasks: [
        t('Baseline model', 'Build a regression or classification model with a train/test split and report the baseline score.', 'Understand the modelling loop.', 'Notebook.', 25),
        t('Evaluation', 'Report the right metrics for your problem type, including a confusion matrix or residual plot, and explain what they mean.', 'Evaluate a model properly.', 'Notebook plus written interpretation.', 20),
        t('Improve the model', 'Try feature engineering or a second algorithm and compare results in a table.', 'Iterate on a model.', 'Notebook with comparison.', 15),
      ],
    },
    {
      title: 'Analytics report',
      summary: 'Write the analysis up for decision-makers.',
      objectives: ['Structure a report', 'Support claims with evidence', 'Give clear recommendations'],
      tasks: [
        t('Report draft', 'Write a report with context, method, findings, charts, limitations and recommendations.', 'Communicate analysis in writing.', 'PDF.', 25),
        t('Recommendations', 'Turn your findings into three specific recommendations, each with the evidence behind it.', 'Make analysis actionable.', 'PDF section.', 15),
      ],
    },
    {
      title: 'Final project',
      summary: 'One end-to-end analysis from raw data to presented conclusion.',
      objectives: ['Deliver a reproducible pipeline', 'Produce a clear report', 'Present findings'],
      isFinal: true,
      tasks: [
        t('Notebook and dataset', 'Submit the complete notebook and the dataset (or a link to it) so the analysis can be rerun.', 'Deliver reproducible work.', 'Notebook plus dataset or link.', 30),
        t('Visualisations', 'Submit at least six final charts, exported and captioned.', 'Show the evidence.', 'Images or PDF.', 20),
        t('Written report', 'Submit the final report: context, method, findings, charts, limitations, recommendations.', 'Deliver the analysis.', 'PDF.', 30),
        t('Presentation', 'Build a 6-10 slide presentation of the project and record a short walkthrough.', 'Present to an audience.', 'Slides plus video link.', 20),
      ],
    },
  ],
};

export const uiUxDesign: FieldRoadmap = {
  slug: 'ui-ux-design',
  name: 'UI/UX Design',
  icon: 'pen',
  shortDescription: 'Research, wireframes, visual systems and a clickable prototype, ending in a case study.',
  description:
    'A product design track that follows one problem all the way through: research it, structure it, design it, prototype it, test it, then write it up as a portfolio case study.',
  skills: ['User research', 'Personas', 'Information architecture', 'Wireframing', 'Design systems', 'Figma', 'Prototyping', 'Usability testing'],
  evaluationCriteria: 'Depth of research, clarity of structure, consistency of the visual system, prototype quality and how well the case study explains your decisions.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and pass the final case study review.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'UX fundamentals',
      summary: 'Define the problem before designing anything.',
      objectives: ['Write a problem statement', 'Build a research-backed persona', 'Map the user journey'],
      tasks: [
        t('Problem statement', 'Choose a product area and write the problem statement, target user and success measure.', 'Design from a defined problem.', 'PDF or Figma frame.'),
        t('User persona', 'Create one primary persona backed by at least five short user interviews or survey responses.', 'Ground design in real users.', 'Persona document plus raw responses.', 20),
        t('User journey map', 'Map the current journey with stages, actions, pain points and opportunities.', 'See the experience end to end.', 'Journey map image or PDF.', 20),
      ],
    },
    {
      title: 'Structure and wireframes',
      summary: 'Decide what goes where before deciding how it looks.',
      objectives: ['Build an information architecture', 'Produce low-fidelity wireframes', 'Design for mobile first'],
      tasks: [
        t('Information architecture', 'Produce a sitemap or screen map with every screen and the paths between them.', 'Structure the product.', 'Diagram image or PDF.', 15),
        t('Mobile wireframes', 'Wireframe at least six mobile screens in low fidelity, with annotations.', 'Plan layouts quickly.', 'Figma link or PDF.', 20),
        t('Desktop wireframes', 'Adapt four of those screens to desktop and note what changes and why.', 'Design across breakpoints.', 'Figma link or PDF.', 15),
      ],
    },
    {
      title: 'Visual system',
      summary: 'Build the design system you will apply everywhere.',
      objectives: ['Define a colour system with contrast in mind', 'Set a type scale', 'Build reusable components'],
      tasks: [
        t('Colour and type', 'Define a palette (primary, neutrals, semantic) and a type scale. Check text contrast meets WCAG AA.', 'Create an accessible visual foundation.', 'Figma file or PDF with contrast checks.', 20),
        t('Component library', 'Build at least ten components: buttons, inputs, cards, nav, modal, table, badge, avatar, tabs, toast — with states.', 'Design systematically.', 'Figma link.', 25),
        t('Usage guidelines', 'Write one page on when to use each key component and the spacing rules.', 'Document the system.', 'PDF.'),
      ],
    },
    {
      title: 'Landing page design',
      summary: 'Apply the system to a high-fidelity marketing page.',
      objectives: ['Design a full landing page', 'Build a clear content hierarchy', 'Write interface copy'],
      tasks: [
        t('Landing page', 'Design a complete landing page in desktop and mobile using your system.', 'Apply the system at scale.', 'Figma link plus exports.', 25),
        t('Copy pass', 'Write the real headline, subheading, section copy and CTA labels. No placeholder text.', 'Treat copy as design content.', 'Figma link plus a copy document.', 15),
      ],
    },
    {
      title: 'Mobile app UI',
      summary: 'High-fidelity screens for the product you scoped.',
      objectives: ['Design core app screens', 'Cover empty, loading and error states', 'Keep the system consistent'],
      tasks: [
        t('Core screens', 'Design at least eight high-fidelity app screens covering the main journey.', 'Deliver a complete UI.', 'Figma link plus exports.', 30),
        t('Edge states', 'Design the empty, loading, error and success states for three key screens.', 'Design the whole experience, not the happy path.', 'Figma link.', 20),
      ],
    },
    {
      title: 'Prototype',
      summary: 'Make it clickable.',
      objectives: ['Link screens into flows', 'Use appropriate transitions', 'Prepare a test script'],
      tasks: [
        t('Clickable prototype', 'Connect your screens into at least two complete flows with working interactions.', 'Simulate the real product.', 'Prototype link.', 30),
        t('Test script', 'Write a usability test script with five tasks and the questions you will ask.', 'Prepare to test properly.', 'PDF.', 15),
      ],
    },
    {
      title: 'Usability and iteration',
      summary: 'Test with real people and act on what you learn.',
      objectives: ['Run usability tests', 'Prioritise findings', 'Redesign based on evidence'],
      tasks: [
        t('Run the test', 'Test with at least three people, record where they hesitated and what they said.', 'Get real feedback.', 'Findings document.', 25),
        t('Iterate', 'Fix the top five issues and submit before and after screens with a note on each change.', 'Improve from evidence.', 'Figma link plus comparison.', 25),
      ],
    },
    {
      title: 'Final case study',
      summary: 'The portfolio-ready write-up of the whole project.',
      objectives: ['Tell the design story', 'Show the process', 'Justify your decisions'],
      isFinal: true,
      tasks: [
        t('Research section', 'Submit the research: problem, persona, journey, findings.', 'Show the foundation.', 'PDF or Figma link.', 20),
        t('Design section', 'Submit wireframes, the design system and the final UI screens.', 'Show the craft.', 'Figma link plus exports.', 30),
        t('Prototype and testing', 'Submit the final prototype link and the usability findings with your changes.', 'Show the evidence of iteration.', 'Prototype link plus PDF.', 25),
        t('Case study document', 'Write the full case study: context, problem, process, decisions, outcome and what you would do next.', 'Deliver portfolio work.', 'PDF or published link.', 25),
      ],
    },
  ],
};

export const graphicDesign: FieldRoadmap = {
  slug: 'graphic-design',
  name: 'Graphic Design',
  icon: 'palette',
  shortDescription: 'Typography, campaigns, brand identity and print-ready marketing material.',
  description:
    'A studio-style track. Each week is a brief with a real deliverable, building from single posts to a complete brand identity and a portfolio you can send to clients.',
  skills: ['Typography', 'Colour theory', 'Composition', 'Brand identity', 'Social media design', 'Print layout', 'Packaging', 'Portfolio building'],
  evaluationCriteria: 'Composition, typographic control, colour use, brief fit and file quality. The final branding project is scored on consistency and completeness of the identity system.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and pass the final branding review.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'Typography, colour and composition',
      summary: 'The three things every design decision comes back to.',
      objectives: ['Pair typefaces deliberately', 'Build a working palette', 'Control visual hierarchy'],
      tasks: [
        t('Type pairing study', 'Produce three type pairings with a short note on why each pair works and where you would use it.', 'Develop typographic judgement.', 'PDF or image set.'),
        t('Three social posts', 'Design three square social posts for one brand, each with a different hierarchy approach.', 'Practise composition under constraint.', 'PNG or JPG files.', 20),
        t('Colour study', 'Build two palettes for the same brand — one warm, one cool — and apply each to the same layout.', 'See how colour changes meaning.', 'Image set.', 15),
      ],
    },
    {
      title: 'Social media campaign',
      summary: 'A connected set of assets, not isolated posts.',
      objectives: ['Design a consistent campaign', 'Work across formats', 'Adapt one idea to many sizes'],
      tasks: [
        t('Campaign concept', 'Write the concept: brand, audience, message, visual direction and the assets you will make.', 'Design from a brief.', 'PDF.'),
        t('Post set', 'Design five feed posts that clearly belong to one campaign.', 'Hold consistency across a set.', 'Image files.', 20),
        t('Stories and advertisement', 'Design three vertical stories and one advertisement banner from the same concept.', 'Adapt across formats.', 'Image files.', 20),
      ],
    },
    {
      title: 'Brand identity',
      summary: 'Build a complete identity for one business.',
      objectives: ['Design an original logo', 'Define the identity system', 'Write brand guidelines'],
      tasks: [
        t('Logo design', 'Design an original logo with a primary lockup, an icon mark and light and dark versions. No stock or traced marks.', 'Design a working identity mark.', 'Vector and PNG files.', 30),
        t('Identity system', 'Define the palette, typography, iconography style and imagery direction.', 'Extend a mark into a system.', 'PDF.', 20),
        t('Brand guideline', 'Produce a 6-10 page guideline covering logo usage, clear space, misuse, colour and type.', 'Document the identity.', 'PDF.', 25),
      ],
    },
    {
      title: 'Marketing material',
      summary: 'Take the identity into print.',
      objectives: ['Design for print', 'Set up files correctly', 'Keep hierarchy in dense layouts'],
      tasks: [
        t('Poster', 'Design an A3 poster for the brand at print resolution with bleed.', 'Design at print scale.', 'PDF (print-ready).', 20),
        t('Flyer and business card', 'Design a double-sided A5 flyer and a business card using the identity.', 'Apply identity consistently.', 'Print-ready PDF.', 20),
      ],
    },
    {
      title: 'Product and packaging',
      summary: 'Design something that exists in three dimensions.',
      objectives: ['Design packaging on a dieline', 'Present a mockup', 'Design a product advertisement'],
      tasks: [
        t('Packaging design', 'Design packaging for one product using a dieline, and present it on a realistic mockup.', 'Design for physical products.', 'PDF plus mockup images.', 25),
        t('Product advertisement', 'Design one advertisement for the product for print and one for social.', 'Sell a product visually.', 'Image files.', 20),
      ],
    },
    {
      title: 'Digital campaign',
      summary: 'A full digital rollout of the identity.',
      objectives: ['Design web banners', 'Design an email header', 'Keep one idea coherent across placements'],
      tasks: [
        t('Banner set', 'Design web banners in three standard sizes plus one animated or sequenced concept.', 'Design to spec.', 'Image files.', 20),
        t('Email and landing visuals', 'Design an email header and the hero visual for a landing page.', 'Extend the campaign online.', 'Image files.', 20),
      ],
    },
    {
      title: 'Portfolio',
      summary: 'Package your work so a client can judge it in 30 seconds.',
      objectives: ['Curate your strongest work', 'Present work in context', 'Write project descriptions'],
      tasks: [
        t('Portfolio build', 'Build a portfolio (PDF or web) with at least six projects, each presented in context with mockups.', 'Present work professionally.', 'PDF or link.', 30),
        t('Project write-ups', 'Write a short brief, approach and outcome for each project.', 'Explain your thinking.', 'PDF section.', 15),
      ],
    },
    {
      title: 'Final branding project',
      summary: 'One complete identity for a new business, fully documented.',
      objectives: ['Deliver a full identity system', 'Show applications', 'Present the rationale'],
      isFinal: true,
      tasks: [
        t('Logo and identity system', 'Submit the final logo suite, palette, typography and iconography.', 'Deliver the core identity.', 'Vector plus PNG files.', 30),
        t('Brand guideline', 'Submit the complete brand guideline document.', 'Document the system.', 'PDF.', 25),
        t('Applications', 'Submit at least six applications: stationery, social, packaging, signage, merchandise, digital.', 'Show the identity working.', 'PDF or image set.', 25),
        t('Rationale presentation', 'Present the concept, research and design decisions in 8-12 slides.', 'Defend your design.', 'PDF slides.', 20),
      ],
    },
  ],
};
