import { t, type FieldRoadmap } from './types';

export const digitalMarketing: FieldRoadmap = {
  slug: 'digital-marketing',
  name: 'Digital Marketing',
  icon: 'megaphone',
  shortDescription: 'Research, content, SEO, ads and analytics — ending in a complete campaign plan.',
  description:
    'You pick one real brand in week 1 and market it for the whole program: research the audience, build the content engine, optimise for search, plan the ads and read the numbers.',
  skills: ['Market research', 'Audience personas', 'Social media strategy', 'Content calendars', 'SEO', 'Paid ads', 'Analytics', 'Campaign planning'],
  evaluationCriteria: 'Quality of research, strategic fit between audience and message, specificity of the plan and correct reading of data. The final campaign is scored on completeness and coherence.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and pass the final campaign review.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'Market research',
      summary: 'Know the brand, the buyer and the competition.',
      objectives: ['Define the target audience', 'Analyse competitors', 'Build a customer persona'],
      tasks: [
        t('Brand brief', 'Pick a real brand or business and write its offer, positioning, price point and current channels.', 'Anchor every later task to one brand.', 'PDF.'),
        t('Audience definition', 'Define the target audience by demographics, behaviour, motivations and objections.', 'Know who you are talking to.', 'PDF.', 15),
        t('Competitor analysis', 'Analyse three competitors on positioning, content, posting frequency and engagement, in a comparison table.', 'Find the gap you can occupy.', 'PDF or spreadsheet.', 20),
        t('Customer persona', 'Build one detailed persona with goals, frustrations, buying triggers and preferred platforms.', 'Make the audience concrete.', 'PDF.', 15),
      ],
    },
    {
      title: 'Social media marketing',
      summary: 'Turn strategy into a publishing plan.',
      objectives: ['Choose the right platforms', 'Plan content pillars', 'Build a working calendar'],
      tasks: [
        t('Platform strategy', 'Choose two platforms for the brand and justify each with audience data.', 'Focus effort where it pays.', 'PDF.'),
        t('Content pillars', 'Define four content pillars and the goal of each.', 'Give content a structure.', 'PDF.', 15),
        t('7-day content calendar', 'Build a 7-day calendar with date, platform, pillar, format, caption and hashtags.', 'Plan publishing in detail.', 'Spreadsheet or PDF.', 25),
      ],
    },
    {
      title: 'Content strategy',
      summary: 'Write the content, not just the plan.',
      objectives: ['Write platform-appropriate copy', 'Use hashtags deliberately', 'Design a posting rhythm'],
      tasks: [
        t('Ten posts', 'Write ten complete posts: hook, body, CTA and hashtags, mapped to your pillars.', 'Produce publishable content.', 'Document.', 25),
        t('Hashtag research', 'Build three hashtag sets (broad, niche, branded) with reach estimates and a note on why each set fits.', 'Use hashtags with intent.', 'Spreadsheet or PDF.', 15),
        t('Content repurposing', 'Take one post and adapt it into four other formats.', 'Get more from each idea.', 'Document.', 15),
      ],
    },
    {
      title: 'SEO',
      summary: 'Get found without paying for every click.',
      objectives: ['Research keywords', 'Optimise on-page elements', 'Structure content for search'],
      tasks: [
        t('Keyword research', 'Find 20 keywords with search volume, difficulty and intent, grouped into topic clusters.', 'Target the right searches.', 'Spreadsheet.', 25),
        t('On-page optimisation', 'Write meta titles and descriptions for five pages, plus a heading structure for each.', 'Optimise what search engines read first.', 'Document.', 20),
        t('SEO audit', 'Audit a real site against a 12-point checklist and list the fixes in priority order.', 'Diagnose search problems.', 'PDF.', 20),
      ],
    },
    {
      title: 'Paid advertising',
      summary: 'Plan a campaign you could actually run.',
      objectives: ['Structure a campaign', 'Write ad copy that converts', 'Set a realistic budget'],
      tasks: [
        t('Campaign structure', 'Plan the campaign, ad sets and targeting with objectives for each level.', 'Structure ads correctly.', 'PDF or spreadsheet.', 20),
        t('Ad copy and creative brief', 'Write three ad variations with headline, primary text and CTA, plus a creative brief for each.', 'Write ads that sell.', 'Document.', 20),
        t('Budget and forecast', 'Build a budget with expected reach, CPC, clicks, conversion rate and cost per acquisition.', 'Plan spend realistically.', 'Spreadsheet.', 20),
      ],
    },
    {
      title: 'Analytics',
      summary: 'Read the numbers and decide what to do next.',
      objectives: ['Choose the right metrics', 'Interpret campaign data', 'Recommend changes from evidence'],
      tasks: [
        t('Metrics framework', 'Define the metrics that matter for the brand at awareness, consideration and conversion, and say why.', 'Measure what matters.', 'PDF.', 15),
        t('Campaign data analysis', 'Analyse the provided sample campaign data, identify what worked and what did not, and support each claim with a number.', 'Draw conclusions from data.', 'PDF plus charts.', 30),
        t('Optimisation plan', 'Recommend five changes based on the data, each with the expected effect.', 'Turn analysis into action.', 'PDF.', 20),
      ],
    },
    {
      title: 'Marketing strategy',
      summary: 'A 30-day plan the brand could hand to a team.',
      objectives: ['Sequence activity over a month', 'Allocate budget and effort', 'Set measurable targets'],
      tasks: [
        t('30-day plan', 'Build a 30-day plan with weekly themes, daily activity, channels, owners and targets.', 'Plan at campaign scale.', 'Spreadsheet or PDF.', 30),
        t('KPIs and targets', 'Set specific targets for each KPI with the baseline you are measuring against.', 'Commit to measurable outcomes.', 'Document.', 15),
      ],
    },
    {
      title: 'Final campaign',
      summary: 'The complete campaign package for your chosen brand.',
      objectives: ['Deliver an integrated campaign', 'Show the reasoning', 'Present it'],
      isFinal: true,
      tasks: [
        t('Strategy document', 'Submit the full strategy: brand, audience, positioning, objectives and channel mix.', 'Deliver the thinking.', 'PDF.', 25),
        t('Content calendar and assets', 'Submit a 30-day calendar plus at least ten finished pieces of content.', 'Deliver the output.', 'Spreadsheet plus assets.', 25),
        t('SEO and ads plan', 'Submit the keyword plan, on-page recommendations, ad structure, copy and budget.', 'Deliver the acquisition plan.', 'PDF.', 25),
        t('Results framework and presentation', 'Submit the measurement framework and a 8-12 slide campaign presentation.', 'Present the campaign.', 'PDF slides.', 25),
      ],
    },
  ],
};

export const contentWritingSeo: FieldRoadmap = {
  slug: 'content-writing-seo',
  name: 'Content Writing & SEO',
  icon: 'pencil',
  shortDescription: 'Articles, product copy, SEO optimisation and a full content strategy.',
  description:
    'A writing track with a search engine attached. You write for real formats — blogs, product pages, ads, emails — and learn to make each one findable.',
  skills: ['Article writing', 'Blog structure', 'SEO writing', 'Keyword research', 'Product descriptions', 'Copywriting', 'Editing', 'Content strategy'],
  evaluationCriteria: 'Clarity, structure, grammar, originality, audience fit and correct SEO application. Plagiarised or unedited AI-generated copy is rejected.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and pass the final content project review.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'Writing fundamentals',
      summary: 'Structure, clarity and voice.',
      objectives: ['Write a clear article', 'Write for different formats', 'Edit your own work'],
      tasks: [
        t('800-word article', 'Write an 800-word article on a topic you know, with a working title, introduction, three sections and a conclusion.', 'Build the basic article skill.', 'DOCX or PDF.', 20),
        t('Ten social captions', 'Write ten captions for one brand across two platforms, each with a hook and a CTA.', 'Write short and sharp.', 'Document.', 15),
        t('Five product descriptions', 'Write five product descriptions of 60-90 words each, focused on benefits rather than specifications.', 'Write to sell.', 'Document.', 15),
        t('Self-edit pass', 'Edit your article down by 20% without losing meaning. Submit both versions.', 'Learn what to cut.', 'Both versions in one file.'),
      ],
    },
    {
      title: 'Blog writing',
      summary: 'Longer form, built for search from the start.',
      objectives: ['Structure a long article', 'Write for search intent', 'Use headings well'],
      tasks: [
        t('Blog outline', 'Pick a keyword and outline a 1,500-word article with H2s, H3s and the question each section answers.', 'Plan before writing.', 'Document.', 15),
        t('SEO-friendly article', 'Write the full 1,500-word article with a target keyword, natural placement, internal link slots and a meta description.', 'Write for readers and search together.', 'DOCX or PDF.', 30),
        t('Readability pass', 'Improve readability: shorter paragraphs, active voice, clear subheadings. Note the changes you made.', 'Write for how people actually read.', 'Revised article plus notes.', 15),
      ],
    },
    {
      title: 'Product and landing copy',
      summary: 'Copy that has a job to do.',
      objectives: ['Write conversion-focused copy', 'Structure a landing page', 'Match copy to buyer stage'],
      tasks: [
        t('Product page set', 'Write five full product pages: title, short description, long description, features, specifications and FAQ.', 'Write complete commercial copy.', 'Document.', 25),
        t('Landing page copy', 'Write a full landing page: hero, problem, solution, benefits, social proof, objection handling and CTA.', 'Write a page that converts.', 'Document.', 25),
        t('Headline test set', 'Write eight headline variations for the landing page and pick two to test, with your reasoning.', 'Recognise what makes a headline work.', 'Document.', 10),
      ],
    },
    {
      title: 'SEO optimisation',
      summary: 'Make the writing findable.',
      objectives: ['Research keywords', 'Optimise on-page elements', 'Plan internal linking'],
      tasks: [
        t('Keyword research', 'Build a keyword map of 20 terms with volume, difficulty, intent and the page each belongs to.', 'Target search demand.', 'Spreadsheet.', 25),
        t('On-page optimisation', 'Optimise three existing pieces: title tag, meta description, heading structure, keyword placement and image alt text.', 'Apply SEO to real content.', 'Before and after document.', 25),
        t('Internal linking plan', 'Design an internal linking structure for a 10-page site with anchor text for each link.', 'Connect content deliberately.', 'Diagram plus table.', 15),
      ],
    },
    {
      title: 'Social content at volume',
      summary: 'Producing consistently without repeating yourself.',
      objectives: ['Write at volume', 'Keep voice consistent', 'Plan a month of content'],
      tasks: [
        t('Thirty captions', 'Write 30 captions for one brand across four content pillars, none repeating a hook.', 'Sustain quality at volume.', 'Spreadsheet or document.', 30),
        t('Content calendar', 'Map the 30 captions to a 30-day calendar with platform, format and posting time.', 'Turn content into a schedule.', 'Spreadsheet.', 20),
      ],
    },
    {
      title: 'Copywriting',
      summary: 'Ads, emails and pages that persuade.',
      objectives: ['Write ad copy', 'Write an email sequence', 'Apply proven frameworks'],
      tasks: [
        t('Ad copy set', 'Write six ads across two platforms using AIDA and PAS, labelling which framework each uses.', 'Use copywriting frameworks deliberately.', 'Document.', 20),
        t('Email sequence', 'Write a five-email sequence: welcome, value, social proof, offer and last call, each with a subject line.', 'Write sequenced persuasion.', 'Document.', 30),
        t('Sales page section', 'Write the objection-handling and guarantee sections for a sales page.', 'Address doubt directly.', 'Document.', 15),
      ],
    },
    {
      title: 'Content strategy',
      summary: 'Plan content like a system, not a series of posts.',
      objectives: ['Build a content plan', 'Align content to funnel stages', 'Define success measures'],
      tasks: [
        t('30-day content strategy', 'Build a strategy with goals, audience, pillars, formats, channels, calendar and measurement.', 'Think in systems.', 'PDF or spreadsheet.', 30),
        t('Funnel mapping', 'Map ten content pieces to awareness, consideration and decision stages, with the next action for each.', 'Connect content to outcomes.', 'Document.', 15),
      ],
    },
    {
      title: 'Final content project',
      summary: 'A complete content package for one brand.',
      objectives: ['Deliver publishable content', 'Show SEO competence', 'Present the strategy'],
      isFinal: true,
      tasks: [
        t('Content portfolio', 'Submit your strongest work: two articles, five product descriptions, one landing page and ten captions, all edited.', 'Deliver publishable writing.', 'PDF or DOCX.', 30),
        t('SEO package', 'Submit the keyword map, optimised meta data and the internal linking plan.', 'Prove SEO application.', 'Spreadsheet plus PDF.', 25),
        t('Content strategy', 'Submit the full 30-day strategy and calendar.', 'Deliver the plan.', 'PDF or spreadsheet.', 25),
        t('Originality statement and presentation', 'Submit a short presentation of the project plus a signed statement that the work is your own original writing.', 'Stand behind your work.', 'PDF.', 20),
      ],
    },
  ],
};

export const gameDevelopment: FieldRoadmap = {
  slug: 'game-development',
  name: 'Game Development',
  icon: 'gamepad',
  shortDescription: 'From game design document to a playable, polished build.',
  description:
    'One game, built week by week. You design it, make the player move, build the levels, add UI, enemies, audio and polish, then ship a playable build with a gameplay video.',
  skills: ['Game design', 'Unity or Godot', 'C# or GDScript', 'Physics and collisions', 'Level design', 'Game UI', 'Basic AI', 'Audio', 'Build pipelines'],
  evaluationCriteria: 'Playability, mechanic clarity, level design, bug count and build reliability. The final game is scored on whether it is genuinely playable start to finish.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and deliver a playable final build.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'Concept and setup',
      summary: 'Decide what you are making before you make it.',
      objectives: ['Write a game design document', 'Set up the engine', 'Build the first scene'],
      tasks: [
        t('Game design document', 'Write a GDD: genre, core loop, win and lose conditions, controls, art direction and scope.', 'Scope a game you can finish.', 'PDF.', 20),
        t('Engine setup', 'Install the engine, create the project, configure version control and commit the empty project.', 'Get a reliable pipeline.', 'Repository link plus screenshot.'),
        t('First scene', 'Build a playable scene with a ground, camera and a placeholder object that responds to one input.', 'Get something on screen fast.', 'Repository plus screenshot.', 15),
      ],
    },
    {
      title: 'Player and controls',
      summary: 'Make movement feel right.',
      objectives: ['Implement player movement', 'Handle input cleanly', 'Tune game feel'],
      tasks: [
        t('Player controller', 'Implement movement, jump or dash, and gravity with tuned values.', 'Build the core interaction.', 'Repository plus a gameplay clip.', 25),
        t('Input handling', 'Support keyboard and at least one alternative input, with remappable or clearly documented controls.', 'Make the game playable by others.', 'Repository plus a controls document.', 15),
        t('Game feel pass', 'Add responsiveness details: coyote time, input buffering, acceleration curves or camera follow smoothing. Explain each.', 'Learn why good games feel good.', 'Repository plus notes.', 15),
      ],
    },
    {
      title: 'Levels and collisions',
      summary: 'Build a world the player can move through.',
      objectives: ['Design a level with intent', 'Set up collisions correctly', 'Add obstacles and hazards'],
      tasks: [
        t('Level one', 'Design and build a complete first level that teaches the mechanic without a tutorial.', 'Teach through level design.', 'Repository plus a gameplay clip.', 25),
        t('Collisions and hazards', 'Implement collision layers, hazards, checkpoints and respawn.', 'Build the rules of the world.', 'Repository.', 20),
        t('Level two', 'Build a second, harder level that combines the mechanics from level one.', 'Design a difficulty curve.', 'Repository plus clip.', 20),
      ],
    },
    {
      title: 'Game UI and systems',
      summary: 'Score, health, menus and game over.',
      objectives: ['Build HUD elements', 'Implement game state', 'Add menus'],
      tasks: [
        t('HUD', 'Add a score display, health or lives indicator and a timer if relevant.', 'Communicate state to the player.', 'Repository plus screenshot.', 20),
        t('Game state machine', 'Implement menu, playing, paused, game over and win states with clean transitions.', 'Structure the game loop.', 'Repository plus a state diagram.', 25),
        t('Menus', 'Build a main menu, pause menu and game over screen with restart and quit.', 'Complete the shell around the game.', 'Repository plus screenshots.', 15),
      ],
    },
    {
      title: 'Enemies and AI',
      summary: 'Give the player something to react to.',
      objectives: ['Implement enemy behaviour', 'Build simple AI states', 'Balance difficulty'],
      tasks: [
        t('Enemy types', 'Implement at least two enemy types with different movement and attack behaviour.', 'Create meaningful opposition.', 'Repository plus clip.', 25),
        t('AI states', 'Give one enemy an idle, patrol, chase and attack state machine.', 'Build believable behaviour.', 'Repository plus a state diagram.', 25),
        t('Difficulty balance', 'Playtest with two people and adjust enemy values based on where they died. Record the before and after values.', 'Balance from evidence.', 'Document plus repository.', 15),
      ],
    },
    {
      title: 'Audio and animation',
      summary: 'The layer that makes it feel finished.',
      objectives: ['Add music and sound effects', 'Animate the player and enemies', 'Add feedback on every action'],
      tasks: [
        t('Sound design', 'Add background music, at least six sound effects and a volume control.', 'Use audio as feedback.', 'Repository plus clip.', 20),
        t('Animation', 'Animate player idle, move, jump and hit states, plus one enemy.', 'Bring characters to life.', 'Repository plus clip.', 25),
        t('Juice pass', 'Add particles, screen shake or hit-stop on key actions — used sparingly.', 'Make actions feel impactful.', 'Repository plus before and after clips.', 15),
      ],
    },
    {
      title: 'Polish and bug fixing',
      summary: 'Make it stable and make it better.',
      objectives: ['Fix defects', 'Improve levels from playtesting', 'Prepare the build'],
      tasks: [
        t('Bug list and fixes', 'Log at least ten bugs with steps to reproduce, severity and the fix.', 'Debug systematically.', 'Bug document plus repository.', 25),
        t('Playtest and improve', 'Playtest with three people, note where they got stuck and improve those sections.', 'Improve from real players.', 'Notes plus repository.', 20),
        t('Build test', 'Produce a build and confirm it runs on a machine other than your own.', 'Verify the build pipeline.', 'Build file or link plus confirmation.', 15),
      ],
    },
    {
      title: 'Final game project',
      summary: 'A playable build, documented and presented.',
      objectives: ['Deliver a complete game', 'Document the design', 'Present the gameplay'],
      isFinal: true,
      tasks: [
        t('Playable build', 'Submit a build that runs start to finish: at least two levels, working menus, win and lose states.', 'Ship a playable game.', 'Build file or hosted link.', 35),
        t('Source code', 'Submit the organised project repository.', 'Deliver reviewable work.', 'Repository link.', 20, { submissionType: 'url' }),
        t('Gameplay video and screenshots', 'Record a 3-5 minute gameplay video and submit at least six screenshots.', 'Show the game in motion.', 'Video link plus images.', 25),
        t('Documentation', 'Submit the final GDD with controls, mechanics, level breakdown, credits and known issues.', 'Document the design.', 'PDF.', 20),
      ],
    },
  ],
};
