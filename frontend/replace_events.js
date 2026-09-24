const fs = require('fs');
let c = fs.readFileSync('components/landing/LandingPage.tsx', 'utf8');

const newEvents = `  const recentEvents = [
    {
      title: "Global Summit",
      date: "2026",
      desc: "Our team representing Maple at the Global Summit.",
      img: "/gisec.png",
    },
    {
      title: "4th Anniversary",
      date: "Oct 12, 2026",
      desc: "Celebrating four years of growth, innovation, and teamwork at Maple.",
      img: "/4thyear.jpg",
    },
    {
      title: "Independence Day",
      date: "Aug 15, 2026",
      desc: "Annual company Independence day celebrations.",
      img: "/independance.jpg",
    },
    {
      title: "Onam",
      date: "Aug 2026",
      desc: "Celebrating Onam at the office.",
      img: "/onam.jpeg",
    },
    {
      title: "Ganesh Chaturthi",
      date: "Sep 2026",
      desc: "Ganesh Chaturthi celebrations.",
      img: "/ganeshchethurthi.jpeg",
    }
  ];`;

const start = c.indexOf('  const recentEvents = [');
const end = c.indexOf('  ];', start) + 4;
c = c.substring(0, start) + newEvents + c.substring(end);

// Enforce landscape aspect ratio instead of fixed height
c = c.replace(/className="md:col-span-3 h-72/g, 'className="md:col-span-3 aspect-[16/9]');
c = c.replace(/className="md:col-span-2 h-72/g, 'className="md:col-span-2 aspect-[16/9]');

fs.writeFileSync('components/landing/LandingPage.tsx', c);
console.log("Updated recent events");
