import { t, type FieldRoadmap } from './types';

export const webDevelopment: FieldRoadmap = {
  slug: 'web-development',
  name: 'Web Development',
  icon: 'code',
  shortDescription: 'Build responsive websites and full-stack applications from markup to deployed API.',
  description:
    'A build-first track. You start with semantic HTML, add responsive CSS and JavaScript behaviour, then connect a real backend and database. Every week ends with something you can put in a portfolio.',
  skills: ['HTML5', 'CSS3', 'Responsive design', 'JavaScript', 'DOM', 'REST APIs', 'Node.js', 'Databases', 'Git'],
  evaluationCriteria: 'Weekly tasks are scored on working functionality, code readability, responsiveness and meeting the stated deliverable. The final project is scored on completeness, code quality, documentation and demo.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and pass the final project review.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'HTML foundations',
      summary: 'Structure pages with semantic markup and accessible forms.',
      objectives: ['Use semantic HTML elements correctly', 'Structure multi-section pages', 'Build accessible forms'],
      tasks: [
        t('Personal profile webpage', 'Build a single-page profile with a header, about section, skills list, education table and footer. Use semantic tags (header, main, section, footer) rather than div for everything.', 'Practise document structure and semantic markup.', 'HTML file plus a hosted link or screenshot.'),
        t('Business webpage', 'Build a one-page site for any small business: hero, services, gallery and contact details. No CSS framework.', 'Translate a real-world brief into page structure.', 'HTML file or repository link.'),
        t('Multi-section website', 'Create a 4-page site (Home, About, Services, Contact) with a shared navigation and working internal links.', 'Practise multi-page navigation and relative paths.', 'ZIP of the site or a GitHub link.', 15),
        t('Contact and registration form', 'Build a form with text, email, phone, select, radio, checkbox, textarea and a submit button. Use labels, required attributes and correct input types.', 'Understand form controls and native validation.', 'HTML file with the form.'),
      ],
    },
    {
      title: 'CSS and responsive design',
      summary: 'Style your pages and make them work on every screen size.',
      objectives: ['Apply the box model confidently', 'Build layouts with Flexbox and Grid', 'Write mobile-first media queries'],
      tasks: [
        t('Style your week 1 website', 'Add a colour system, spacing scale and typography to the multi-section website from week 1.', 'Apply visual hierarchy with CSS.', 'Updated site with a stylesheet.'),
        t('Responsive navigation', 'Build a navigation bar that collapses into a menu button under 768px. CSS-only or minimal JS.', 'Handle navigation across breakpoints.', 'Working nav demo.'),
        t('Responsive card layout', 'Build a card grid that shows 3 columns on desktop, 2 on tablet and 1 on mobile using CSS Grid.', 'Practise Grid and media queries.', 'HTML and CSS files.'),
        t('Mobile, tablet and desktop layouts', 'Take one page and produce three screenshots showing it at 375px, 768px and 1440px with no horizontal scrolling.', 'Verify layouts hold at real breakpoints.', 'Three screenshots plus the source.', 15),
        t('Typography and spacing pass', 'Refine line length, line height, heading scale and vertical rhythm across the site. Write two lines on what you changed and why.', 'Develop an eye for readable type.', 'Updated CSS plus a short note.'),
      ],
    },
    {
      title: 'JavaScript',
      summary: 'Add behaviour: events, validation, state and DOM updates.',
      objectives: ['Handle events and update the DOM', 'Validate user input in JavaScript', 'Work with arrays and objects'],
      tasks: [
        t('Interactive components', 'Build three working components: a theme toggle, an accordion and a modal dialog.', 'Practise event handling and DOM manipulation.', 'Single HTML file or repository link.'),
        t('Form validation', 'Add JavaScript validation to your week 1 form: required fields, email format, password length, and inline error messages.', 'Validate input and give useful feedback.', 'Working form with validation.'),
        t('Dynamic to-do list', 'Build a to-do list that adds, completes, edits and deletes items, with a count of remaining items.', 'Manage state in the browser.', 'Working app plus source.', 15),
        t('Search and filter', 'Render a list of at least 12 items from an array and add live text search plus category filtering.', 'Transform data into UI.', 'Working demo.'),
        t('Add JavaScript to your project', 'Bring the week 2 site to life with at least three interactive behaviours.', 'Combine markup, styling and behaviour.', 'Updated project link.'),
      ],
    },
    {
      title: 'Frontend project',
      summary: 'Ship one complete responsive business website.',
      objectives: ['Plan and deliver a multi-page site', 'Apply a consistent design system', 'Write a short project README'],
      tasks: [
        t('Project plan and wireframe', 'Choose a business, list the pages, sketch each page and list the components you will reuse.', 'Plan before building.', 'PDF or image of the plan.'),
        t('Build the site', 'Build the full responsive site: minimum 4 pages, shared header and footer, working forms and at least three interactive elements.', 'Deliver a complete frontend.', 'Repository link plus live demo.', 30),
        t('README and screenshots', 'Write a README covering what it is, how to run it, and the tech used. Add three screenshots.', 'Document your work for a reviewer.', 'README file and screenshots.'),
      ],
    },
    {
      title: 'Working with APIs',
      summary: 'Fetch remote data and handle loading and error states properly.',
      objectives: ['Call a REST API with fetch', 'Render asynchronous data', 'Handle loading, empty and error states'],
      tasks: [
        t('Public API integration', 'Pick a free public API and fetch data into a page on load.', 'Understand async data fetching.', 'Working demo plus source.'),
        t('Display and paginate data', 'Render the API results as cards or rows with pagination or infinite scroll.', 'Present remote data usefully.', 'Working demo.', 15),
        t('Search, filter and states', 'Add search against the API or the fetched array, plus visible loading, empty and error states.', 'Handle the full request lifecycle.', 'Working demo with all states shown in screenshots.', 15),
      ],
    },
    {
      title: 'Backend and data',
      summary: 'Build a REST API with full CRUD and connect it to your frontend.',
      objectives: ['Build REST endpoints', 'Persist data', 'Connect a frontend to your own API'],
      tasks: [
        t('REST API with CRUD', 'Build an API with GET, POST, PUT and DELETE for one resource, using Node/Express or an equivalent.', 'Design and implement endpoints.', 'Repository link plus sample requests.', 20),
        t('Data storage', 'Persist the resource in a database (PostgreSQL, MongoDB or SQLite) instead of memory.', 'Work with a real database.', 'Repository plus schema or migration file.', 15),
        t('Connect frontend and backend', 'Point your frontend at your own API so create, read, update and delete all work end to end.', 'Complete the request path from UI to database.', 'Repository plus a short demo video or GIF.', 20),
      ],
    },
    {
      title: 'Full-stack build',
      summary: 'Build one complete application of your choice.',
      objectives: ['Combine frontend, API and database', 'Handle authentication basics', 'Deploy a working build'],
      tasks: [
        t('Choose and scope the app', 'Pick one: task manager, blog, product catalogue or student portal. List the features, data model and routes.', 'Scope a real application.', 'Scope document (PDF or markdown).'),
        t('Build the application', 'Implement the app with working CRUD, at least one list view, one detail view and basic login.', 'Deliver a working full-stack app.', 'Repository link.', 30),
        t('Deploy', 'Deploy the app and confirm it runs outside your machine.', 'Practise deployment.', 'Live URL.', 15),
      ],
    },
    {
      title: 'Final project',
      summary: 'A portfolio-ready full-stack application with documentation and a demo.',
      objectives: ['Ship a complete application', 'Document it clearly', 'Present it as portfolio work'],
      isFinal: true,
      tasks: [
        t('Source code and repository', 'Push clean, commented source to a public repository with a sensible commit history.', 'Deliver reviewable code.', 'GitHub repository link.', 30, { submissionType: 'url' }),
        t('Live demo and screenshots', 'Deploy the application and capture at least five screenshots of the main flows.', 'Show the working product.', 'Live URL plus screenshots.', 25),
        t('Documentation', 'Write documentation covering features, setup, environment variables, data model and known limitations.', 'Communicate your work.', 'PDF or README.', 25),
        t('Walkthrough video', 'Record a 3-5 minute walkthrough explaining what you built and the hardest problem you solved.', 'Practise presenting technical work.', 'Video link.', 20, { submissionType: 'url' }),
      ],
    },
  ],
};

export const javaFullStack: FieldRoadmap = {
  slug: 'java-full-stack',
  name: 'Java Full Stack Development',
  icon: 'layers',
  shortDescription: 'Core Java and OOP through to a Spring-style REST backend with a connected frontend.',
  description:
    'A backend-heavy track built on Java fundamentals. You move from language basics and OOP to collections, SQL, REST APIs, authentication and a deployed full-stack application.',
  skills: ['Java', 'OOP', 'Collections', 'Exception handling', 'JDBC', 'SQL', 'REST APIs', 'Spring Boot', 'Maven'],
  evaluationCriteria: 'Correctness, use of OOP principles, exception handling, database design and API structure. The final project is scored on completeness, code organisation and documentation.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and pass the final project review.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'Java fundamentals and OOP',
      summary: 'Syntax, control flow, methods and the four OOP pillars.',
      objectives: ['Write correct Java programs', 'Use classes and objects', 'Apply inheritance and polymorphism'],
      tasks: [
        t('Core syntax programs', 'Write five small programs: prime check, reverse a number, Fibonacci series, string palindrome and a simple calculator.', 'Get fluent with syntax and control flow.', 'Java files in a ZIP or repository.'),
        t('Methods and arrays', 'Write a program that reads an integer array and returns the maximum, minimum, average and sorted output using separate methods.', 'Practise decomposition.', 'Java source file.'),
        t('OOP mini project', 'Model a library with Book, Member and Library classes. Use encapsulation, at least one interface and method overriding.', 'Apply OOP to a domain.', 'Repository link plus a class diagram.', 20),
      ],
    },
    {
      title: 'Collections, exceptions and files',
      summary: 'Work with the collections framework and handle failure properly.',
      objectives: ['Choose the right collection', 'Handle checked and unchecked exceptions', 'Read and write files'],
      tasks: [
        t('Collections practice', 'Solve five problems using ArrayList, HashMap, HashSet and TreeMap, including word frequency counting.', 'Know when to use each collection.', 'Java source files.'),
        t('Custom exceptions', 'Add validation to the library project with at least two custom exception classes and try-with-resources.', 'Fail safely and clearly.', 'Updated repository.'),
        t('Console management system', 'Build a console app that manages records with add, list, search, update and delete, saving to a file so data survives restart.', 'Combine collections, exceptions and file IO.', 'Repository plus a run screenshot.', 25),
      ],
    },
    {
      title: 'SQL and databases',
      summary: 'Design tables, write queries and connect Java to a database.',
      objectives: ['Design a normalised schema', 'Write joins and aggregates', 'Use JDBC for CRUD'],
      tasks: [
        t('Schema design', 'Design a schema for a student management system with at least four related tables. Include keys and constraints.', 'Model relational data.', 'SQL file plus an ER diagram.', 15),
        t('Query set', 'Write 10 queries covering joins, group by, having, subqueries and ordering.', 'Query data confidently.', 'SQL file with results.'),
        t('JDBC CRUD', 'Rewrite your console app to read and write through JDBC instead of files.', 'Connect Java to a database.', 'Repository link.', 20),
      ],
    },
    {
      title: 'REST backend',
      summary: 'Expose your data over HTTP.',
      objectives: ['Build REST endpoints', 'Use layered architecture', 'Return correct status codes'],
      tasks: [
        t('First REST API', 'Build a Spring Boot (or equivalent) API with GET, POST, PUT and DELETE for one entity.', 'Serve data over HTTP.', 'Repository link.', 20),
        t('Layered structure', 'Split the project into controller, service, repository and model layers with DTOs.', 'Write maintainable backend code.', 'Repository link.', 15),
        t('Validation and errors', 'Add request validation and a global exception handler returning meaningful status codes and messages.', 'Make the API predictable.', 'Repository plus sample responses.', 15),
      ],
    },
    {
      title: 'Authentication and roles',
      summary: 'Sign-up, login and role-based access.',
      objectives: ['Hash passwords correctly', 'Issue and verify tokens', 'Restrict endpoints by role'],
      tasks: [
        t('Signup and login', 'Add registration and login endpoints with hashed passwords.', 'Handle credentials safely.', 'Repository link.', 20),
        t('Role-based access', 'Add USER and ADMIN roles and protect at least two endpoints by role.', 'Enforce authorisation server-side.', 'Repository plus a test table of who can call what.', 20),
      ],
    },
    {
      title: 'Frontend integration',
      summary: 'Connect a UI to your Java backend.',
      objectives: ['Consume your own API', 'Handle auth in the client', 'Show loading and error states'],
      tasks: [
        t('Build the client', 'Build a frontend (plain JS, React or Thymeleaf) that lists, creates and edits your entity through the API.', 'Complete the stack.', 'Repository link.', 25),
        t('Auth flow in the UI', 'Add login, token storage, protected pages and logout.', 'Handle sessions in the browser.', 'Repository plus a demo GIF.', 20),
      ],
    },
    {
      title: 'Full-stack build',
      summary: 'One complete application, end to end.',
      objectives: ['Integrate every layer', 'Test the main flows', 'Prepare for deployment'],
      tasks: [
        t('Feature complete build', 'Finish the application with at least two entities, relationships, auth and roles.', 'Deliver a working system.', 'Repository link.', 30),
        t('Test the flows', 'Document manual test cases for the main flows with expected and actual results.', 'Verify before shipping.', 'Test document.', 15),
      ],
    },
    {
      title: 'Final project',
      summary: 'Deliver the complete Java full-stack application.',
      objectives: ['Ship frontend, backend and database together', 'Document setup and API', 'Present the result'],
      isFinal: true,
      tasks: [
        t('Backend and database', 'Submit the final backend with schema, migrations or SQL dump and seed data.', 'Deliver a reproducible backend.', 'Repository plus SQL file.', 30),
        t('Frontend', 'Submit the connected frontend covering every main flow.', 'Deliver the user-facing half.', 'Repository link.', 25),
        t('API documentation', 'Document every endpoint with method, path, request body, response and status codes.', 'Make the API usable by others.', 'PDF or markdown.', 25),
        t('Demo video', 'Record a 3-5 minute demo of the full user journey.', 'Present your project.', 'Video link.', 20, { submissionType: 'url' }),
      ],
    },
  ],
};

export const mobileAppDevelopment: FieldRoadmap = {
  slug: 'mobile-app-development',
  name: 'Mobile App Development',
  icon: 'smartphone',
  shortDescription: 'Screens, navigation, state and APIs — through to a buildable mobile app.',
  description:
    'Built around one app that grows every week. Use Flutter, React Native or native Android; the roadmap is framework-neutral and the deliverables stay the same.',
  skills: ['Mobile UI', 'Navigation', 'State management', 'REST integration', 'Local storage', 'Authentication', 'App builds'],
  evaluationCriteria: 'Screen quality, navigation correctness, state handling, API integration and build reliability. The final app is scored on completeness, polish and documentation.',
  certificateCriteria: 'Submit every required task, have at least 70% of required task points approved each week, and deliver a running final build.',
  rewardCriteria: 'Top three overall scores in your duration group, confirmed by admin after final evaluation.',
  weeks: [
    {
      title: 'Setup and first screens',
      summary: 'Get the toolchain running and build your first screens.',
      objectives: ['Set up the development environment', 'Build static screens', 'Run on an emulator or device'],
      tasks: [
        t('Environment setup', 'Install the SDK and emulator, create a new project and run it. Capture a screenshot of the running app.', 'Get a reliable local setup.', 'Screenshot plus repository link.'),
        t('Profile screen', 'Build a profile screen with an avatar, name, bio, stats row and an edit button.', 'Practise layout primitives.', 'Repository plus screenshot.', 15),
        t('Splash and onboarding', 'Add a splash screen and a three-slide onboarding flow.', 'Handle app entry states.', 'Repository plus screenshots.'),
      ],
    },
    {
      title: 'Layouts, navigation and forms',
      summary: 'Move between screens and collect input.',
      objectives: ['Implement stack and tab navigation', 'Build responsive layouts', 'Validate form input'],
      tasks: [
        t('Navigation shell', 'Add bottom tab navigation with at least three tabs and stack navigation inside one tab.', 'Structure app navigation.', 'Repository plus a screen-flow diagram.', 15),
        t('Form screen', 'Build a form with text fields, dropdown, date picker and validation messages.', 'Collect input safely.', 'Repository plus screenshot.', 15),
        t('Responsive layout', 'Make one screen work on a small phone, a large phone and a tablet.', 'Handle varied screen sizes.', 'Three screenshots.'),
      ],
    },
    {
      title: 'State, lists and interaction',
      summary: 'Manage state and render dynamic lists.',
      objectives: ['Manage app state', 'Render performant lists', 'Handle user interactions'],
      tasks: [
        t('State management', 'Introduce a state solution (Provider, Riverpod, Redux, Bloc or equivalent) and move screen state into it.', 'Separate state from UI.', 'Repository link.', 20),
        t('List and detail', 'Build a scrollable list of at least 20 items with pull-to-refresh and a detail screen.', 'Handle list rendering and navigation with parameters.', 'Repository plus screenshots.', 20),
        t('Interactions', 'Add search, sorting, and a favourite or bookmark action that persists during the session.', 'Make the app feel responsive.', 'Repository plus demo GIF.', 15),
      ],
    },
    {
      title: 'API integration',
      summary: 'Replace mock data with live data.',
      objectives: ['Call REST APIs from mobile', 'Model responses', 'Handle failure gracefully'],
      tasks: [
        t('Fetch live data', 'Replace hard-coded data with a REST API and map responses to model classes.', 'Work with remote data.', 'Repository link.', 20),
        t('Loading and error states', 'Add loading indicators, an empty state, an error state and a retry action.', 'Handle the full request lifecycle.', 'Screenshots of each state.', 15),
      ],
    },
    {
      title: 'Authentication',
      summary: 'Sign-up, login and protected screens.',
      objectives: ['Implement auth flows', 'Store tokens securely', 'Protect routes'],
      tasks: [
        t('Auth screens and flow', 'Build signup, login, logout and a protected area that redirects unauthenticated users.', 'Implement a full auth flow.', 'Repository plus demo GIF.', 25),
        t('Secure token storage', 'Store the session token in secure storage rather than plain preferences, and keep the user signed in across restarts.', 'Handle credentials safely on device.', 'Repository plus a short note on your approach.', 15),
      ],
    },
    {
      title: 'Local database',
      summary: 'Persist data on the device.',
      objectives: ['Use a local database', 'Sync local and remote data', 'Support offline reading'],
      tasks: [
        t('Local persistence', 'Add SQLite, Hive, Room or equivalent and persist the main entity locally.', 'Store structured data on device.', 'Repository link.', 20),
        t('Offline mode', 'Show cached data when the device is offline and refresh when the connection returns.', 'Handle real-world connectivity.', 'Repository plus a demo video.', 20),
      ],
    },
    {
      title: 'Complete the app',
      summary: 'Finish features, fix bugs and polish.',
      objectives: ['Close the feature list', 'Fix defects', 'Improve visual polish'],
      tasks: [
        t('Feature completion', 'Finish every planned screen and remove dead code and placeholder text.', 'Deliver a coherent app.', 'Repository link.', 25),
        t('Bug list and fixes', 'List at least eight defects you found and how you fixed each one.', 'Practise structured debugging.', 'Bug document.', 15),
      ],
    },
    {
      title: 'Final app',
      summary: 'A running build with documentation and a demo.',
      objectives: ['Produce an installable build', 'Document the app', 'Present the result'],
      isFinal: true,
      tasks: [
        t('Source code', 'Submit the complete, organised source repository.', 'Deliver reviewable code.', 'Repository link.', 30, { submissionType: 'url' }),
        t('Build', 'Produce a release build (APK, AAB or a signed test build) or a hosted preview if a store build is not possible.', 'Ship something installable.', 'Build file or link.', 25, { allowedFileTypes: ['zip', 'apk', 'pdf'] }),
        t('Screenshots and documentation', 'Submit at least six screenshots and documentation covering features, setup and architecture.', 'Document the product.', 'PDF plus images.', 25),
        t('Gameplay-style walkthrough', 'Record a 3-5 minute screen recording of the full user journey.', 'Present the app.', 'Video link.', 20, { submissionType: 'url' }),
      ],
    },
  ],
};
