const INLINE_PARTIALS = {
    'components/header.html': `
<div class="topbar">
    <div class="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div class="d-flex flex-wrap align-items-center gap-3">
            <a href="mailto:info@npcrwanda.org" class="topbar-link"><i class="fas fa-envelope me-1" aria-hidden="true"></i> info@npcrwanda.org</a>
            <a href="tel:+250788400887" class="topbar-link"><i class="fas fa-phone me-1" aria-hidden="true"></i> +250 788 400 887</a>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-3">
            <div class="lang-switcher dropdown" aria-label="Language selector" data-i18n-aria-label="phrase.Language selector">
                <button class="btn btn-sm btn-light dropdown-toggle" type="button" id="langMenu" data-bs-toggle="dropdown" aria-expanded="false">
                    <span data-current-lang-label>EN</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="langMenu">
                    <li><button class="dropdown-item lang-btn" type="button" data-lang-set="en">English</button></li>
                    <li><button class="dropdown-item lang-btn" type="button" data-lang-set="fr">Français</button></li>
                    <li><button class="dropdown-item lang-btn" type="button" data-lang-set="rw">Kinyarwanda</button></li>
                </ul>
            </div>
            <a href="contact.html#volunteer" class="topbar-link" data-i18n="common.volunteer">Volunteer</a>
            <a href="contact.html#donate" class="topbar-link topbar-link-strong" data-i18n="common.donate">Donate</a>
        </div>
    </div>
</div>
<nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm" id="main-nav">
    <div class="container border-0">
        <a class="navbar-brand d-flex align-items-center" href="index.html">
            <img src="assets/img/logo.png" alt="NPC Rwanda Logo" data-i18n-alt="phrase.NPC Rwanda Logo" class="me-2" style="height: 60px; width: auto; object-fit: contain;">
            <div class="brand-text">
                <span class="d-block fw-bold" style="color: var(--dark-blue); font-size: 1.1rem; line-height: 1;">NPC RWANDA</span>
                <small class="text-muted" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">PARALYMPIC COMMITTEE</small>
            </div>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" data-i18n-aria-label="phrase.Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto">
                <li class="nav-item"><a class="nav-link" href="index.html" data-i18n="nav.home">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="about.html" data-i18n="nav.about">About</a></li>
                <li class="nav-item"><a class="nav-link" href="sports.html" data-i18n="nav.sports">Sports</a></li>
                <li class="nav-item"><a class="nav-link" href="athletes.html" data-i18n="nav.athletes">Athletes</a></li>
                <li class="nav-item dropdown nav-news-group">
                    <a class="nav-link dropdown-toggle" href="news.html" id="newsEventsMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-i18n="nav.news_events">News/Events</a>
                    <ul class="dropdown-menu" aria-labelledby="newsEventsMenu">
                        <li><a class="dropdown-item" href="news.html" data-i18n="nav.news">News</a></li>
                        <li><a class="dropdown-item" href="news.html#events-schedule" data-i18n="nav.events">Events</a></li>
                    </ul>
                </li>
                <li class="nav-item"><a class="nav-link" href="system.html" data-i18n="nav.system">System</a></li>
                <li class="nav-item"><a class="nav-link" href="careers.html" data-i18n="nav.careers">Careers</a></li>
                <li class="nav-item"><a class="nav-link" href="contact.html" data-i18n="nav.contact">Contact</a></li>
            </ul>
            <div class="nav-buttons">
                <a href="login.html" class="btn btn-outline-primary">Login</a>
            </div>
        </div>
    </div>
</nav>`,
    'components/footer.html': `
<footer id="main-footer">
    <div class="container">
        <div class="row g-5">
            <div class="col-lg-4">
                <div class="footer-logo d-flex align-items-center mb-4">
                    <img src="assets/img/logo.png" alt="NPC Rwanda Logo" data-i18n-alt="phrase.NPC Rwanda Logo" class="me-2" style="height: 50px; width: auto; object-fit: contain;">
                    <h5 class="mb-0">NPC RWANDA</h5>
                </div>
                <p class="small" data-i18n="phrase.The National Paralympic Committee of Rwanda is dedicated to the development of Paralympic sports and fostering inclusion for persons with disabilities through the power of athletic excellence.">The National Paralympic Committee of Rwanda is dedicated to the development of Paralympic sports and fostering inclusion for persons with disabilities through the power of athletic excellence.</p>
            </div>
            <div class="col-6 col-lg-2">
                <h5 data-i18n="footer.quick_links">Quick Links</h5>
                <ul class="list-unstyled small">
                    <li class="mb-2"><a href="index.html" data-i18n="nav.home">Home</a></li>
                    <li class="mb-2"><a href="about.html" data-i18n="footer.about_npc">About NPC</a></li>
                    <li class="mb-2"><a href="sports.html" data-i18n="footer.sports_programs">Sports Programs</a></li>
                    <li class="mb-2"><a href="athletes.html" data-i18n="footer.our_athletes">Our Athletes</a></li>
                    <li class="mb-2"><a href="news.html" data-i18n="nav.news_events">News/Events</a></li>
                    <li class="mb-2"><a href="careers.html" data-i18n="nav.careers">Careers</a></li>
                    <li class="mb-2"><a href="system.html" data-i18n="footer.system_directory">System Directory</a></li>
                </ul>
            </div>
            <div class="col-6 col-lg-2">
                <h5 data-i18n="nav.governance">Governance</h5>
                <ul class="list-unstyled small">
                    <li class="mb-2"><a href="governance.html#board" data-i18n="system.board_members">Board Members</a></li>
                    <li class="mb-2"><a href="governance.html#reports" data-i18n="footer.annual_reports">Annual Reports</a></li>
                    <li class="mb-2"><a href="governance.html#policies" data-i18n="footer.policies">Policies</a></li>
                    <li class="mb-2"><a href="governance.html#strategic-plan" data-i18n="footer.strategic_plan">Strategic Plan</a></li>
                </ul>
            </div>
            <div class="col-lg-4">
                <h5 data-i18n="footer.contact_info">Contact Info</h5>
                <ul class="list-unstyled small">
                    <li class="mb-3"><i class="fas fa-location-dot me-3 text-accent-yellow"></i> Amahoro National Stadium, Remera, Kigali, Rwanda</li>
                    <li class="mb-3"><i class="fas fa-phone me-3 text-accent-yellow"></i> +250 788 400 887</li>
                    <li class="mb-3"><i class="fas fa-envelope me-3 text-accent-yellow"></i> info@npcrwanda.org</li>
                </ul>
            </div>
        </div>
      
        <div class="footer-bottom">
            <p class="mb-0">&copy; <span id="year"></span> <span data-i18n="footer.rights">National Paralympic Committee of Rwanda. All Rights Reserved.</span></p>
        </div>
    </div>
</footer>`,
    'components/news-sidebar.html': `
<div class="news-sidebar-card mb-4">
    <div class="news-sidebar-card__head">
        <h4 class="h6 text-uppercase fw-bold mb-1" data-i18n="phrase.Search News">Search News</h4>
        <small class="text-muted" data-i18n="phrase.Instant updates">Instant updates</small>
    </div>
    <form class="input-group news-sidebar-card__search">
        <input type="text" class="form-control border-0 bg-transparent" placeholder="Search articles..." aria-label="Search news" data-i18n-placeholder="phrase.Search articles..." data-i18n-aria-label="phrase.Search news">
        <button class="btn btn-link" type="button" aria-label="Search" data-i18n-aria-label="phrase.Search"><i class="fas fa-search text-primary"></i></button>
    </form>
</div>

<div class="news-sidebar-card mb-4">
    <div class="news-sidebar-card__head">
        <h4 class="h6 text-uppercase fw-bold mb-1" data-i18n="phrase.Categories">Categories</h4>
        <small class="text-muted" data-i18n="phrase.Filter by topic">Filter by topic</small>
    </div>
    <ul class="list-unstyled mb-0">
        <li class="mb-2"><a href="#" class="news-sidebar-link"><span data-i18n="phrase.Competition Updates">Competition Updates</span> <span class="badge bg-light text-dark">12</span></a></li>
        <li class="mb-2"><a href="#" class="news-sidebar-link"><span data-i18n="phrase.Program Launches">Program Launches</span> <span class="badge bg-light text-dark">5</span></a></li>
        <li class="mb-2"><a href="#" class="news-sidebar-link"><span data-i18n="phrase.Athlete Stories">Athlete Stories</span> <span class="badge bg-light text-dark">8</span></a></li>
        <li><a href="#" class="news-sidebar-link"><span data-i18n="phrase.Governance">Governance</span> <span class="badge bg-light text-dark">3</span></a></li>
    </ul>
</div>

<div class="news-sidebar-card news-sidebar-card--accent">
    <div class="news-sidebar-card__head">
        <h4 class="h6 text-uppercase fw-bold mb-1 text-white" data-i18n="phrase.Newsletter">Newsletter</h4>
        <small class="text-white-50" data-i18n="phrase.Get updates">Get updates</small>
    </div>
    <p class="small text-white-75 mb-3" data-i18n="phrase.Get the latest updates delivered to your inbox.">Get the latest updates delivered to your inbox.</p>
    <form>
        <input type="email" class="form-control news-sidebar-card__input mb-2" placeholder="Email address" aria-label="Email address" data-i18n-placeholder="phrase.Email address" data-i18n-aria-label="phrase.Email address">
        <button class="btn btn-light w-100 fw-bold text-primary" data-i18n="phrase.Subscribe">Subscribe</button>
    </form>
</div>`
};

const LANG_LABELS = {
    en: 'EN',
    fr: 'FR',
    rw: 'KIN'
};

const I18N = {
    en: {
        'common.donate': 'Donate',
        'common.volunteer': 'Volunteer',
        'common.open': 'Open',
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.sports': 'Sports',
        'nav.athletes': 'Athletes',
        'nav.news': 'News',
        'nav.news_events': 'News/Events',
        'nav.events': 'Events',
        'nav.governance': 'Governance',
        'nav.system': 'System',
        'nav.careers': 'Careers',
        'nav.contact': 'Contact',
        'footer.quick_links': 'Quick Links',
        'footer.about_npc': 'About NPC',
        'footer.sports_programs': 'Sports Programs',
        'footer.our_athletes': 'Our Athletes',
        'footer.system_directory': 'System Directory',
        'footer.annual_reports': 'Annual Reports',
        'footer.policies': 'Policies',
        'footer.strategic_plan': 'Strategic Plan',
        'footer.contact_info': 'Contact Info',
        'footer.photo_credits_label': 'Photo Credits:',
        'footer.photo_credits_text': 'Images sourced from Picsum Photos for demonstration use.',
        'footer.rights': 'National Paralympic Committee of Rwanda. All Rights Reserved.',
        'system.browser_title': 'NPC System Directory | NPC Rwanda',
        'system.meta_description': 'Central directory for NPC Rwanda governance, committees, contacts, publications, resources, staff, and sports systems.',
        'system.page_title': 'NPC System Directory',
        'system.directory': 'Directory',
        'system.core_items': 'Core System Items',
        'system.intro': 'All requested governance, program, and communication categories in one place.',
        'system.group_governance': 'Governance',
        'system.group_programs': 'Programs',
        'system.group_comms_resources': 'Communications & Resources',
        'system.npc_background': 'NPC Background',
        'system.npc_background_desc': 'History, mandate, and institutional identity.',
        'system.board_members': 'Board Members',
        'system.board_members_desc': 'Leadership and governance structure.',
        'system.audit_committees': 'Audit Committees',
        'system.audit_committees_desc': 'Financial and compliance oversight committees.',
        'system.conflict_resolution_committees': 'Conflict Resolution Committees',
        'system.conflict_resolution_committees_desc': 'Dispute and grievance handling channels.',
        'system.schedule_plan': 'Schedule Plan',
        'system.schedule_plan_desc': 'Planning timelines and yearly activity roadmap.',
        'system.publication': 'Publication',
        'system.publication_desc': 'Reports, updates, and official publications.',
        'system.sports': 'Sports',
        'system.sports_desc': 'Disciplines, programs, and athlete pathways.',
        'system.npc_federations': 'NPC Federations',
        'system.npc_federations_desc': 'Partner federations supporting para-sports.',
        'system.events': 'Events',
        'system.events_desc': 'National and international events calendar.',
        'system.dpsco_contacts': 'DPSCO Contacts',
        'system.dpsco_contacts_desc': 'District-level contact and coordination points.',
        'system.npc_associations': 'NPC Associations',
        'system.npc_associations_desc': 'Member associations and network affiliations.',
        'system.resources': 'Resources',
        'system.resources_desc': 'Policies, tools, and downloadable resources.',
        'system.social_media': 'Social Media',
        'system.social_media_desc': 'Official social communication channels.',
        'system.staff': 'Staff',
        'system.staff_desc': 'Secretariat and technical staff profiles.'
    },
    fr: {
        'common.donate': 'Faire un don',
        'common.volunteer': 'Bénévolat',
        'common.open': 'Ouvrir',
        'nav.home': 'Accueil',
        'nav.about': 'À propos',
        'nav.sports': 'Sports',
        'nav.athletes': 'Athlètes',
        'nav.news': 'Actualités',
        'nav.news_events': 'Actualités/Événements',
        'nav.events': 'Événements',
        'nav.governance': 'Gouvernance',
        'nav.system': 'Système',
        'nav.careers': 'Carrières',
        'nav.contact': 'Contact',
        'footer.quick_links': 'Liens rapides',
        'footer.about_npc': 'À propos du NPC',
        'footer.sports_programs': 'Programmes sportifs',
        'footer.our_athletes': 'Nos athlètes',
        'footer.system_directory': 'Répertoire du système',
        'footer.annual_reports': 'Rapports annuels',
        'footer.policies': 'Politiques',
        'footer.strategic_plan': 'Plan stratégique',
        'footer.contact_info': 'Informations de contact',
        'footer.photo_credits_label': 'Crédits photo :',
        'footer.photo_credits_text': 'Images provenant de Picsum Photos à des fins de démonstration.',
        'footer.rights': 'Comité National Paralympique du Rwanda. Tous droits réservés.',
        'system.browser_title': 'Répertoire du système NPC | NPC Rwanda',
        'system.meta_description': 'Répertoire central de la gouvernance, des comités, des contacts, des publications, des ressources, du personnel et des sports du NPC Rwanda.',
        'system.page_title': 'Répertoire du système NPC',
        'system.directory': 'Répertoire',
        'system.core_items': 'Éléments clés du système',
        'system.intro': 'Toutes les catégories demandées de gouvernance, programmes et communication en un seul endroit.',
        'system.group_governance': 'Gouvernance',
        'system.group_programs': 'Programmes',
        'system.group_comms_resources': 'Communication et ressources',
        'system.npc_background': 'Contexte du NPC',
        'system.npc_background_desc': 'Historique, mandat et identité institutionnelle.',
        'system.board_members': 'Membres du conseil',
        'system.board_members_desc': 'Leadership et structure de gouvernance.',
        'system.audit_committees': 'Comités d’audit',
        'system.audit_committees_desc': 'Comités de supervision financière et de conformité.',
        'system.conflict_resolution_committees': 'Comités de résolution des conflits',
        'system.conflict_resolution_committees_desc': 'Canaux de traitement des litiges et griefs.',
        'system.schedule_plan': 'Planification',
        'system.schedule_plan_desc': 'Calendrier de planification et feuille de route annuelle.',
        'system.publication': 'Publication',
        'system.publication_desc': 'Rapports, actualités et publications officielles.',
        'system.sports': 'Sports',
        'system.sports_desc': 'Disciplines, programmes et parcours des athlètes.',
        'system.npc_federations': 'Fédérations NPC',
        'system.npc_federations_desc': 'Fédérations partenaires soutenant le para-sport.',
        'system.events': 'Événements',
        'system.events_desc': 'Calendrier des événements nationaux et internationaux.',
        'system.dpsco_contacts': 'Contacts DPSCO',
        'system.dpsco_contacts_desc': 'Points de contact et de coordination au niveau des districts.',
        'system.npc_associations': 'Associations NPC',
        'system.npc_associations_desc': 'Associations membres et affiliations du réseau.',
        'system.resources': 'Ressources',
        'system.resources_desc': 'Politiques, outils et ressources téléchargeables.',
        'system.social_media': 'Réseaux sociaux',
        'system.social_media_desc': 'Canaux officiels de communication sociale.',
        'system.staff': 'Personnel',
        'system.staff_desc': 'Profils du secrétariat et du personnel technique.'
    },
    rw: {
        'common.donate': 'Tanga inkunga',
        'common.volunteer': 'Ba umukorerabushake',
        'common.open': 'Fungura',
        'nav.home': 'Ahabanza',
        'nav.about': 'Ibyerekeye',
        'nav.sports': 'Imikino',
        'nav.athletes': 'Abakinnyi',
        'nav.news': 'Amakuru',
        'nav.news_events': 'Amakuru/Ibirori',
        'nav.events': 'Ibirori',
        'nav.governance': 'Imiyoborere',
        'nav.system': 'Sisitemu',
        'nav.careers': 'Akazi',
        'nav.contact': 'Twandikire',
        'footer.quick_links': 'Aho wanyura vuba',
        'footer.about_npc': 'Ibyerekeye NPC',
        'footer.sports_programs': 'Gahunda z\'imikino',
        'footer.our_athletes': 'Abakinnyi bacu',
        'footer.system_directory': 'Urutonde rwa sisitemu',
        'footer.annual_reports': 'Raporo z\'umwaka',
        'footer.policies': 'Amategeko ngenderwaho',
        'footer.strategic_plan': 'Gahunda y\'ingamba',
        'footer.contact_info': 'Amakuru yo kutwandikira',
        'footer.photo_credits_label': 'Aho amafoto yavuye:',
        'footer.photo_credits_text': 'Amafoto yakuwe kuri Picsum Photos agamije kwerekana urugero.',
        'footer.rights': 'Komite y\'Igihugu y\'Imikino y\'Abafite Ubumuga mu Rwanda. Uburenganzira bwose burabitswe.',
        'system.browser_title': 'Urutonde rwa Sisitemu ya NPC | NPC Rwanda',
        'system.meta_description': 'Urutonde rukuru rw\'imiyoborere, komite, aho baherereye, ibitabo, ibikoresho, abakozi n\'imikino bya NPC Rwanda.',
        'system.page_title': 'Urutonde rwa Sisitemu ya NPC',
        'system.directory': 'Urutonde',
        'system.core_items': 'Ibyiciro by\'ingenzi bya sisitemu',
        'system.intro': 'Ibyiciro byose byasabwe by\'imiyoborere, gahunda n\'itumanaho biri hamwe.',
        'system.group_governance': 'Imiyoborere',
        'system.group_programs': 'Gahunda',
        'system.group_comms_resources': 'Itumanaho n\'Ibikoresho',
        'system.npc_background': 'Inkomoko ya NPC',
        'system.npc_background_desc': 'Amateka, inshingano n\'isura y\'ikigo.',
        'system.board_members': 'Abagize Inama y\'Ubuyobozi',
        'system.board_members_desc': 'Ubuyobozi n\'imiterere y\'imiyoborere.',
        'system.audit_committees': 'Komite z\'Ubugenzuzi',
        'system.audit_committees_desc': 'Komite zireba imari n\'iyubahirizwa ry\'amategeko.',
        'system.conflict_resolution_committees': 'Komite zo Gukemura Amakimbirane',
        'system.conflict_resolution_committees_desc': 'Inzira zo kwakira no gukemura ibibazo.',
        'system.schedule_plan': 'Gahunda y\'Ingengabihe',
        'system.schedule_plan_desc': 'Ingengabihe n\'imirongo y\'ibikorwa by\'umwaka.',
        'system.publication': 'Ibitangazwa',
        'system.publication_desc': 'Raporo, amakuru n\'ibitabo byemewe.',
        'system.sports': 'Imikino',
        'system.sports_desc': 'Amashami y\'imikino, gahunda n\'inzira z\'abakinnyi.',
        'system.npc_federations': 'Federasiyo za NPC',
        'system.npc_federations_desc': 'Federasiyo z\'abafatanyabikorwa mu mikino y\'abafite ubumuga.',
        'system.events': 'Ibirori',
        'system.events_desc': 'Ingengabihe y\'ibirori byo mu gihugu no hanze.',
        'system.dpsco_contacts': 'Aho wahamagara DPSCO',
        'system.dpsco_contacts_desc': 'Aho babarizwa n\'aho baherereza serivisi ku rwego rw\'uturere.',
        'system.npc_associations': 'Amashyirahamwe ya NPC',
        'system.npc_associations_desc': 'Amashyirahamwe abanyamuryango n\'ubufatanye.',
        'system.resources': 'Ibikoresho',
        'system.resources_desc': 'Amabwiriza, ibikoresho n\'inyandiko zikururwa.',
        'system.social_media': 'Imbuga nkoranyambaga',
        'system.social_media_desc': 'Imiyoboro yemewe yo gutangaza amakuru.',
        'system.staff': 'Abakozi',
        'system.staff_desc': 'Abakozi ba sekretariya n\'aba tekiniki.'
    }
};

const PHRASE_I18N = {
    fr: {
        "RWANDA'S PARALYMPIC PRIDE": "FIERTÉ PARALYMPIQUE DU RWANDA",
        'Empowering Ability.': 'Valoriser les capacités.',
        'Inspiring Rwanda.': 'Inspirer le Rwanda.',
        'Learn More': 'En savoir plus',
        'Partner With Us': 'Devenir partenaire',
        'Impact Snapshot': 'Aperçu de l’impact',
        'Building Pathways for Inclusive Excellence': 'Construire des parcours vers l’excellence inclusive',
        'Who We Are': 'Qui sommes-nous',
        'Driving Inclusion Through Sport': 'Promouvoir l’inclusion par le sport',
        'Our Sports Programs': 'Nos programmes sportifs',
        'Featured Athletes': 'Athlètes en vedette',
        'Latest News & Updates': 'Dernières actualités et mises à jour',
        'Governance & Transparency': 'Gouvernance et transparence',
        'Support Inclusive Sports in Rwanda': 'Soutenir les sports inclusifs au Rwanda',
        'Donate Now': 'Faire un don maintenant',
        'About NPC Rwanda': 'À propos du NPC Rwanda',
        'Our History': 'Notre histoire',
        'Our Vision': 'Notre vision',
        'Our Mission': 'Notre mission',
        'Core Values': 'Valeurs fondamentales',
        'Our Leadership': 'Notre leadership',
        'Strategic Objectives': 'Objectifs stratégiques',
        'Sports Programs': 'Programmes sportifs',
        'Our Disciplines': 'Nos disciplines',
        'Program Overview': 'Aperçu du programme',
        'Want to Join a Team?': 'Vous souhaitez rejoindre une équipe ?',
        'Talk to a Program Coordinator': 'Parler à un coordinateur de programme',
        'Our Athletes': 'Nos athlètes',
        'Filter by Sport': 'Filtrer par sport',
        'Filter by Category': 'Filtrer par catégorie',
        'Apply Filters': 'Appliquer les filtres',
        'View Full Profile': 'Voir le profil complet',
        'Latest News | NPC Rwanda': 'Actualités | NPC Rwanda',
        'Latest News & Events': 'Dernières actualités et événements',
        'Featured Story': 'Article à la une',
        'Editorial Highlights': 'Faits saillants éditoriaux',
        'Read Full Story': 'Lire l’article complet',
        'Read Article': 'Lire l’article',
        'Goalball Championship 2024: A Call for Visibility and Support for Rwanda’s Blind Athletes': 'Championnat de Goalball 2024 : un appel à la visibilité et au soutien des athlètes malvoyants du Rwanda',
        'A Celebration of Unity: Rwanda’s Sitting Volleyball Team Faces France in the 2024 International Paralympic Committee Championships': 'Célébration de l’unité : l’équipe rwandaise de volley assis affronte la France aux championnats 2024 du Comité International Paralympique',
        'Celebrating Inclusivity: Boccia Players Unite at Petit Stadium': 'Célébrer l’inclusion : les joueurs de boccia se réunissent au stade Petit',
        'Understanding Disabilities in Parapowerlifting: A Look Ahead to the 2024 Championship in Rwanda': 'Comprendre les handicaps en para powerlifting : aperçu du championnat 2024 au Rwanda',
        'Search News': 'Rechercher des actualités',
        'Categories': 'Catégories',
        'Newsletter': 'Bulletin',
        'Subscribe': 'S’abonner',
        'Governance & Transparency | NPC Rwanda': 'Gouvernance et transparence | NPC Rwanda',
        'How We Are Managed': 'Comment nous sommes gérés',
        'Key Documents': 'Documents clés',
        'Official Policies': 'Politiques officielles',
        'Our Structure': 'Notre structure',
        'Need Information?': 'Besoin d’informations ?',
        'Contact Secretariat': 'Contacter le secrétariat',
        'Contact Us': 'Contactez-nous',
        'Get in Touch': 'Entrer en contact',
        'Send a Message': 'Envoyer un message',
        'Full Name': 'Nom complet',
        'Subject': 'Sujet',
        'Message': 'Message',
        'Send Message': 'Envoyer le message',
        'Donate to Inclusive Sport': 'Faire un don pour le sport inclusif',
        'Volunteer With NPC Rwanda': 'Faire du bénévolat avec le NPC Rwanda',
        'Apply by Email': 'Postuler par e-mail',
        'NPC System Directory': 'Répertoire du système NPC',
        'Directory': 'Répertoire',
        'Core System Items': 'Éléments clés du système',
        'Governance': 'Gouvernance',
        'Programs': 'Programmes',
        'Communications & Resources': 'Communication et ressources',
        'Open': 'Ouvrir',
        'Trending now': 'Tendances du moment',
        'See social trends': 'Voir les tendances sociales',
        'Social Trends': 'Tendances sociales',
        'Trending from X and Facebook': 'Tendances de X et Facebook',
        'Connect your official accounts to display live updates automatically.': 'Connectez vos comptes officiels pour afficher automatiquement les mises à jour en direct.',
        'X Timeline': 'Fil X',
        'Facebook Feed': 'Fil Facebook',
        'Open on X': 'Ouvrir sur X',
        'Open on Facebook': 'Ouvrir sur Facebook',
        'No trending stories available right now.': 'Aucune actualité tendance pour le moment.',
        'View More': 'Voir plus',
        'X timeline is unavailable right now.': 'Le fil X est indisponible pour le moment.',
        'Latest updates': 'Dernières mises à jour',
        'NPC Rwanda updates on athlete development and community inclusion': 'Mises à jour du NPC Rwanda sur le développement des athlètes et l’inclusion communautaire',
        'New announcements on competitions and events': 'Nouvelles annonces sur les compétitions et les événements',
        'Latest governance and program highlights': 'Derniers points clés sur la gouvernance et les programmes'
    },
    rw: {
        "RWANDA'S PARALYMPIC PRIDE": 'ISHEMA RY’IMIKINO Y’ABAFITE UBUMUGA MU RWANDA',
        'Empowering Ability.': 'Dushyigikira ubushobozi.',
        'Inspiring Rwanda.': 'Dutera u Rwanda imbaraga.',
        'Learn More': 'Menya byinshi',
        'Partner With Us': 'Dufatanye',
        'Impact Snapshot': 'Incamake y’ingaruka',
        'Building Pathways for Inclusive Excellence': 'Kubaka inzira z\'ubudashyira hamwe ziganisha ku ntsinzi',
        'Who We Are': 'Abo turi bo',
        'Driving Inclusion Through Sport': 'Guteza imbere ubudaheranwa biciye muri siporo',
        'Our Sports Programs': 'Gahunda zacu z’imikino',
        'Featured Athletes': 'Abakinnyi bagaragara',
        'Latest News & Updates': 'Amakuru n’ibigezweho',
        'Governance & Transparency': 'Imiyoborere n’ukugaragariza bose',
        'Support Inclusive Sports in Rwanda': 'Shyigikira imikino ihuza bose mu Rwanda',
        'Donate Now': 'Tanga inkunga ubu',
        'About NPC Rwanda': 'Ibyerekeye NPC Rwanda',
        'Our History': 'Amateka yacu',
        'Our Vision': 'Icyerekezo cyacu',
        'Our Mission': 'Inshingano zacu',
        'Core Values': 'Indangagaciro shingiro',
        'Our Leadership': 'Ubuyobozi bwacu',
        'Strategic Objectives': 'Intego z’ingenzi',
        'Sports Programs': 'Gahunda z’imikino',
        'Our Disciplines': 'Amashami yacu',
        'Program Overview': 'Incamake ya gahunda',
        'Want to Join a Team?': 'Urashaka kujya mu ikipe?',
        'Talk to a Program Coordinator': 'Vugana n\'umuhuzabikorwa wa gahunda',
        'Our Athletes': 'Abakinnyi bacu',
        'Filter by Sport': 'Shungura ukurikije umukino',
        'Filter by Category': 'Shungura ukurikije icyiciro',
        'Apply Filters': 'Shyiraho gushungura',
        'View Full Profile': 'Reba umwirondoro wose',
        'Latest News | NPC Rwanda': 'Amakuru agezweho | NPC Rwanda',
        'Latest News & Events': 'Amakuru n\'ibirori biheruka',
        'Featured Story': 'Inkuru y’ingenzi',
        'Editorial Highlights': 'Incamake z\'ingenzi',
        'Read Full Story': 'Soma inkuru yose',
        'Read Article': 'Soma inkuru',
        'Goalball Championship 2024: A Call for Visibility and Support for Rwanda’s Blind Athletes': 'Shampiyona ya Goalball 2024: guhamagarira kugaragaza no gushyigikira abakinnyi batabona bo mu Rwanda',
        'A Celebration of Unity: Rwanda’s Sitting Volleyball Team Faces France in the 2024 International Paralympic Committee Championships': 'Ibirori by’ubumwe: ikipe y’u Rwanda ya Sitting Volleyball ihura n’Ubufaransa mu marushanwa mpuzamahanga ya Paralympic 2024',
        'Celebrating Inclusivity: Boccia Players Unite at Petit Stadium': 'Kwizihiza ubudaheranwa: abakinnyi ba Boccia bahuriye kuri Petit Stadium',
        'Understanding Disabilities in Parapowerlifting: A Look Ahead to the 2024 Championship in Rwanda': 'Gusobanukirwa ubumuga muri Parapowerlifting: kureba imbere kuri shampiyona 2024 mu Rwanda',
        'Search News': 'Shakisha amakuru',
        'Categories': 'Ibyiciro',
        'Newsletter': 'Ikusanyamakuru',
        'Subscribe': 'Iyandikishe',
        'How We Are Managed': 'Uko tuyoborwa',
        'Key Documents': 'Inyandiko z’ingenzi',
        'Official Policies': 'Amategeko yemewe',
        'Our Structure': 'Imiterere yacu',
        'Need Information?': 'Ukeneye amakuru?',
        'Contact Secretariat': 'Vugisha sekretariya',
        'Contact Us': 'Twandikire',
        'Get in Touch': 'Tuvugishe',
        'Send a Message': 'Ohereza ubutumwa',
        'Full Name': 'Amazina yose',
        'Subject': 'Insanganyamatsiko',
        'Message': 'Ubutumwa',
        'Send Message': 'Ohereza ubutumwa',
        'Donate to Inclusive Sport': 'Tanga inkunga muri siporo ihuza bose',
        'Volunteer With NPC Rwanda': 'Kora nk’umukorerabushake muri NPC Rwanda',
        'Apply by Email': 'Saba ukoresheje imeli',
        'NPC System Directory': 'Urutonde rwa Sisitemu ya NPC',
        'Directory': 'Urutonde',
        'Core System Items': 'Ibyiciro by’ingenzi bya sisitemu',
        'Governance': 'Imiyoborere',
        'Programs': 'Gahunda',
        'Communications & Resources': 'Itumanaho n’ibikoresho',
        'Open': 'Fungura',
        'Trending now': 'Ibiri gukundwa ubu',
        'See social trends': 'Reba ibiri kuvugwa ku mbuga',
        'Social Trends': 'Ibigarukwaho ku mbuga',
        'Trending from X and Facebook': 'Ibiri gukundwa kuri X na Facebook',
        'Connect your official accounts to display live updates automatically.': 'Huza konti zanyu zemewe kugira ngo amakuru mashya agaragare ako kanya.',
        'X Timeline': 'Urutonde rwa X',
        'Facebook Feed': 'Urutonde rwa Facebook',
        'Open on X': 'Fungura kuri X',
        'Open on Facebook': 'Fungura kuri Facebook',
        'No trending stories available right now.': 'Nta makuru ari gukundwa ahari ubu.',
        'View More': 'Reba byinshi',
        'X timeline is unavailable right now.': 'Urutonde rwa X ntirubonetse ubu.',
        'Latest updates': 'Amakuru mashya',
        'NPC Rwanda updates on athlete development and community inclusion': 'Amakuru mashya ya NPC Rwanda ku iterambere ry’abakinnyi n’ubudaheranwa mu muryango',
        'New announcements on competitions and events': 'Amatangazo mashya ku marushanwa n’ibikorwa',
        'Latest governance and program highlights': 'Ibyagezweho bya vuba mu miyoborere no muri gahunda'
    }
};

function getCurrentLang() {
    const lang = localStorage.getItem('site_lang');
    return I18N[lang] ? lang : 'en';
}

function t(lang, key) {
    if (key && key.startsWith('phrase.')) {
        const phrase = key.slice(7);
        if (lang === 'en') return phrase;
        const mapped = PHRASE_I18N[lang] && PHRASE_I18N[lang][phrase];
        return mapped || phrase;
    }
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

const i18nHooks = [];

function registerI18nHook(hook) {
    if (typeof hook === 'function') {
        i18nHooks.push(hook);
    }
}

function applyTranslations(lang) {
    document.documentElement.lang = lang === 'rw' ? 'rw' : lang;
    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach((node) => {
        const key = node.getAttribute('data-i18n');
        node.textContent = t(lang, key);
    });
    const contentNodes = document.querySelectorAll('[data-i18n-content]');
    contentNodes.forEach((node) => {
        const key = node.getAttribute('data-i18n-content');
        node.setAttribute('content', t(lang, key));
    });
    const placeholderNodes = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderNodes.forEach((node) => {
        const key = node.getAttribute('data-i18n-placeholder');
        node.setAttribute('placeholder', t(lang, key));
    });
    const ariaNodes = document.querySelectorAll('[data-i18n-aria-label]');
    ariaNodes.forEach((node) => {
        const key = node.getAttribute('data-i18n-aria-label');
        node.setAttribute('aria-label', t(lang, key));
    });
    const titleNodes = document.querySelectorAll('[data-i18n-title]');
    titleNodes.forEach((node) => {
        const key = node.getAttribute('data-i18n-title');
        node.setAttribute('title', t(lang, key));
    });
    const altNodes = document.querySelectorAll('[data-i18n-alt]');
    altNodes.forEach((node) => {
        const key = node.getAttribute('data-i18n-alt');
        node.setAttribute('alt', t(lang, key));
    });
    const langButtons = document.querySelectorAll('[data-lang-set]');
    langButtons.forEach((btn) => {
        const active = btn.getAttribute('data-lang-set') === lang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const currentLabelNode = document.querySelector('[data-current-lang-label]');
    if (currentLabelNode) {
        currentLabelNode.textContent = LANG_LABELS[lang] || lang.toUpperCase();
    }
    i18nHooks.forEach((hook) => hook(lang));
}


function initLanguageSwitcher() {
    const buttons = document.querySelectorAll('[data-lang-set]');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang-set');
            if (!I18N[lang]) return;
            localStorage.setItem('site_lang', lang);
            applyTranslations(lang);
        });
    });
    applyTranslations(getCurrentLang());
}

window.npcT = (key) => t(getCurrentLang(), key);

async function injectFragment(target, path) {
    if (!target || !path) return;
    try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load ' + path);
        target.innerHTML = await response.text();
    } catch (error) {
        const fallback = INLINE_PARTIALS[path];
        if (fallback) {
            target.innerHTML = fallback;
            return;
        }
        console.warn(error);
    }
}

async function injectPartials() {
    const partials = document.querySelectorAll('[data-include]');
    const jobs = Array.from(partials).map((partial) => {
        const path = partial.getAttribute('data-include');
        return injectFragment(partial, path);
    });
    await Promise.all(jobs);
}

function setActiveNav() {
    const active = document.body.getAttribute('data-active');
    if (!active) return;
    const links = document.querySelectorAll('.navbar .nav-link');
    links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (href.startsWith(active)) {
            link.classList.add('active');
        }
    });
}

function setYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

function initAOS() {
    if (window.AOS && typeof window.AOS.init === 'function') {
        window.AOS.init({
            disable: true,
            duration: 0,
            once: true
        });
    }
}

function initNavbar() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const navMode = document.body.getAttribute('data-nav');
    if (navMode === 'solid') {
        nav.classList.add('scrolled');
    }
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else if (navMode !== 'solid') {
            nav.classList.remove('scrolled');
        }
    });
}

function initAnchorLinks() {
    const anchors = document.querySelectorAll('a[href*="#"]');
    anchors.forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;

            const [path, hash] = href.split('#');
            if (!hash) return;

            const samePage = !path || path === window.location.pathname.split('/').pop();
            if (!samePage) return;

            const target = document.getElementById(hash);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', '#' + hash);
        });
    });
}

async function initCareersPage() {
    const jobsContainer = document.getElementById('careers-jobs');
    if (!jobsContainer) return;

    const loadingEl = document.getElementById('careers-loading');
    const source = jobsContainer.getAttribute('data-careers-source') || 'assets/data/jobs.json';
    let jobs = [];

    try {
        const response = await fetch(source, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load jobs data');
        const payload = await response.json();
        jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
    } catch (error) {
        console.warn(error);
    }

    const todayIsoLocal = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isOpenJob = (job) => {
        if (!job || typeof job !== 'object') return false;
        if (job.expired === true) return false;
        if (!job.deadline_iso) return true;
        return job.deadline_iso >= todayIsoLocal();
    };

    const render = (lang) => {
        const openJobs = jobs.filter(isOpenJob);

        if (!openJobs.length) {
            jobsContainer.innerHTML = `<div class="col-12"><div class="custom-card p-4"><p class="mb-0 text-muted">${t(lang, 'phrase.No jobs available right now. Please check back soon.')}</p></div></div>`;
            if (loadingEl) loadingEl.style.display = 'none';
            return;
        }

        jobsContainer.innerHTML = openJobs.map((job, index) => {
            const title = t(lang, job.title_key || '');
            const type = t(lang, job.type_key || '');
            const meta = t(lang, job.location_deadline_key || '');
            const description = t(lang, job.description_key || '');
            const applyLabel = t(lang, job.apply_label_key || 'phrase.Apply for This Role');
            const subject = encodeURIComponent(job.apply_subject || 'Career Application');
            const delay = Math.min(index * 100, 300);

            return `
                <div class="col-lg-6" data-aos="fade-up" data-aos-delay="${delay}">
                    <article class="custom-card p-4 h-100">
                        <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                            <h3 class="h5 mb-0">${title}</h3>
                            <span class="badge bg-primary">${type}</span>
                        </div>
                        <p class="small text-muted mb-3">${meta}</p>
                        <p class="mb-4">${description}</p>
                        <a href="mailto:info@npcrwanda.org?subject=${subject}" class="btn btn-outline-primary">${applyLabel}</a>
                    </article>
                </div>
            `;
        }).join('');

        if (loadingEl) loadingEl.style.display = 'none';
    };

    registerI18nHook(render);
    render(getCurrentLang());
}

function loadAccessibilityWidget() {
    if (document.querySelector('script[src="assets/js/accessibility.js"]')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/accessibility.js';
    script.setAttribute('data-generated', 'true');
    document.body.appendChild(script);
}

function ensureXWidgetScript() {
    if (document.querySelector('script[data-x-widget-script]')) return;
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.setAttribute('data-x-widget-script', 'true');
    document.body.appendChild(script);
}

function renderXFallback(xContainer, lang, posts, xUrl) {
    if (!xContainer) return;
    const fallbackPosts = Array.isArray(posts) ? posts : [];
    const heading = t(lang, 'phrase.Latest updates');
    const unavailable = t(lang, 'phrase.X timeline is unavailable right now.');
    const viewMore = t(lang, 'phrase.View More');

    if (!fallbackPosts.length) {
        xContainer.innerHTML = `
            <div class="social-fallback">
                <p class="small text-muted mb-2">${unavailable}</p>
                <a href="${xUrl}" target="_blank" rel="noopener" class="small fw-bold text-primary text-decoration-none">${t(lang, 'phrase.Open on X')}</a>
            </div>
        `;
        return;
    }

    xContainer.innerHTML = `
        <div class="social-fallback">
            <p class="small fw-bold mb-2">${heading}</p>
            <ul class="social-fallback-list">
                ${fallbackPosts.map((post) => {
                    const label = t(lang, post.title_key || '');
                    const link = post.link || xUrl;
                    return `<li><a href="${link}" target="_blank" rel="noopener">${label || viewMore}</a></li>`;
                }).join('')}
            </ul>
            <a href="${xUrl}" target="_blank" rel="noopener" class="small fw-bold text-primary text-decoration-none">${t(lang, 'phrase.Open on X')}</a>
        </div>
    `;
}

async function initTrendingSection() {
    const list = document.getElementById('trending-list');
    if (!list) return;

    const source = list.getAttribute('data-trending-source') || 'assets/data/trending.json';
    let payload = {};

    try {
        const response = await fetch(source, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load trending data');
        payload = await response.json();
    } catch (error) {
        console.warn(error);
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    const social = payload.social || {};
    const xFallbackPosts = Array.isArray(social.x_fallback_posts) ? social.x_fallback_posts : [];

    const xUrl = social.x_timeline_url || 'https://twitter.com/npc_rwanda';
    const facebookUrl = social.facebook_page_url || 'https://www.facebook.com/npcrwanda/';

    const xFollowLink = document.getElementById('x-follow-link');
    const facebookFollowLink = document.getElementById('facebook-follow-link');
    if (xFollowLink) xFollowLink.href = xUrl;
    if (facebookFollowLink) facebookFollowLink.href = facebookUrl;

    const xEmbed = document.querySelector('#x-timeline-embed .twitter-timeline');
    if (xEmbed) {
        xEmbed.setAttribute('href', xUrl);
        ensureXWidgetScript();
        if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') {
            window.twttr.widgets.load();
        }
        window.setTimeout(() => {
            const xContainer = document.getElementById('x-timeline-embed');
            if (!xContainer) return;
            const hasIframe = !!xContainer.querySelector('iframe');
            if (!hasIframe) {
                renderXFallback(xContainer, getCurrentLang(), xFallbackPosts, xUrl);
            }
        }, 3500);
    }

    const fbEmbedWrap = document.getElementById('facebook-page-embed');
    if (fbEmbedWrap) {
        const encodedUrl = encodeURIComponent(facebookUrl);
        fbEmbedWrap.innerHTML = `
            <iframe
                title="Facebook Page Feed"
                src="https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=500&height=300&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                width="100%"
                height="300"
                style="border:none;overflow:hidden"
                scrolling="no"
                frameborder="0"
                allowfullscreen="true"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
            </iframe>
        `;
    }

    const render = (lang) => {
        if (!items.length) {
            list.innerHTML = `<p class="text-muted mb-0">${t(lang, 'phrase.No trending stories available right now.')}</p>`;
            return;
        }

        list.innerHTML = items.map((item) => {
            const title = t(lang, item.title_key || '');
            const viewMore = t(lang, item.cta_key || 'phrase.View More');
            const imageAlt = t(lang, item.alt_key || item.title_key || '');
            const link = item.link || 'news.html';
            const image = item.image || 'assets/img/curated/news-hero.jpg';

            return `
                <article class="trending-card">
                    <img src="${image}" alt="${imageAlt}" class="trending-thumb">
                    <div>
                        <h3 class="h6 mb-2">${title}</h3>
                        <a href="${link}" class="small fw-bold text-primary text-decoration-none">${viewMore}</a>
                    </div>
                </article>
            `;
        }).join('');
    };

    registerI18nHook(render);
    registerI18nHook((lang) => {
        const xContainer = document.getElementById('x-timeline-embed');
        if (!xContainer) return;
        const isFallbackShown = !!xContainer.querySelector('.social-fallback');
        if (isFallbackShown) {
            renderXFallback(xContainer, lang, xFallbackPosts, xUrl);
        }
    });
    render(getCurrentLang());
}

loadAccessibilityWidget();

window.addEventListener('DOMContentLoaded', async () => {
    await injectPartials();
    initLanguageSwitcher();
    await initCareersPage();
    await initTrendingSection();
    setActiveNav();
    setYear();
    initAOS();
    initNavbar();
    initAnchorLinks();
});
