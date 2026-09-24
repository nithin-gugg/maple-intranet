const fs = require('fs');
let c = fs.readFileSync('components/landing/OurVerticals.tsx', 'utf8');
const newArray = `const verticals = [
  {
    id: "maple-learning-solutions",
    label: "VERTICAL 01",
    title: "Maple Learning Solutions",
    description: "AI-powered eLearning company in India & UAE, building custom learning content and digital training programs for global workforces.",
    image: "/maple.webp",
    href: "/verticals/maple-learning-solutions"
  },
  {
    id: "lxdguild",
    label: "VERTICAL 02",
    title: "LXDGUILD & Academy",
    description: "India's largest L&D community with 8000+ followers, connecting learning experience designers and running academy programs.",
    image: "/lxdguild.webp",
    href: "/verticals/lxdguild"
  },
  {
    id: "maple-web-works",
    label: "VERTICAL 03",
    title: "Maple Web Works",
    description: "Modern, high-performance web design and development for brands that need a fast, polished digital presence.",
    image: "/mapleweb.webp",
    href: "/verticals/maple-web-works"
  }
];`;

const start = c.indexOf('const verticals = [');
const end = c.indexOf('];', start) + 2;
c = c.substring(0, start) + newArray + c.substring(end);
fs.writeFileSync('components/landing/OurVerticals.tsx', c);
console.log("Updated verticals array");
