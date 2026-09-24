const fs = require('fs');
let c = fs.readFileSync('components/landing/LandingPage.tsx', 'utf8');

const replaceState = `  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const RESOURCE_TABS: Record<string, string> = {
    ONBOARDING: "Onboarding",
    TEAMS_DEPARTMENTS: "Teams & Departments",
    ANNOUNCEMENTS_UPDATES: "Announcements & Updates",
    SOPS: "SOPs",
    WORKFLOWS: "Workflows"
  };
  
  const [activeResourceTab, setActiveResourceTab] = useState("ONBOARDING");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents\`);
        const data = await res.json();
        setDocuments(data || []);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  const topResourcesContent = documents
    .filter(doc => (doc.category?.name || "UNCATEGORIZED_OFFICIAL") === activeResourceTab)
    .slice(0, 4);`;

const stateStartRegex = /const \[activeResourceTab, setActiveResourceTab\] = useState\("Company & News"\);\s*const resourceTabs = \["Business Resources", "Employee Center", "Departments & Teams", "Company & News"\];\s*const topResourcesContent = \[\s*\{[\s\S]*?\s*\}\s*\];/m;

c = c.replace(stateStartRegex, replaceState);

const replaceJsxTabs = `{Object.entries(RESOURCE_TABS).map(([key, label]) => (
              <button suppressHydrationWarning
                key={key}
                onClick={() => setActiveResourceTab(key)}
                className={\`px-2 py-2 text-sm font-semibold transition-colors \${activeResourceTab === key ? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'}\`}
              >
                {label}
              </button>
            ))}`;

const jsxStartRegex = /\{resourceTabs\.map\(tab => \(\s*<button suppressHydrationWarning\s*key=\{tab\}\s*onClick=\{\(\) => setActiveResourceTab\(tab\)\}\s*className=\{`px-2 py-2 text-sm font-semibold transition-colors \$\{activeResourceTab === tab \? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'\}`\}\s*>\s*\{tab\}\s*<\/button>\s*\)\)\}/m;

c = c.replace(jsxStartRegex, replaceJsxTabs);

const replaceContent = `{loadingDocs ? (
              <div className="col-span-full py-12 flex justify-center text-slate-400"><Loader2 className="h-6 w-6 animate-spin text-brand-green mr-2" /> Loading documents...</div>
            ) : topResourcesContent.length === 0 ? (
              <div className="col-span-full py-12 flex justify-center text-slate-400">No documents found in this category.</div>
            ) : topResourcesContent.map((resource, i) => (
              <Link key={i} href={\`/documents?subcategory=\${activeResourceTab}\`} className="bg-[#37474f] rounded-lg overflow-hidden hover:bg-[#455a64] transition-colors border border-white/5 flex flex-col h-full shadow-lg group">
                <div className="h-32 overflow-hidden bg-slate-800 flex items-center justify-center relative">
                  {resource.thumbnail_url ? (
                    <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <FileText className="h-12 w-12 text-slate-500 opacity-50" />
                  )}
                </div>
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-lg mb-3 text-white group-hover:text-brand-green transition-colors">{resource.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{resource.description || "No description provided."}</p>
                </div>
              </Link>
            ))}`;

const contentStartRegex = /\{topResourcesContent\.map\(\(resource, i\) => \(\s*<Link key=\{i\} href="\/documents" className="bg-\[#37474f\] rounded-lg overflow-hidden hover:bg-\[#455a64\] transition-colors border border-white\/5 flex flex-col h-full shadow-lg group">\s*<div className="h-32 overflow-hidden bg-slate-800">\s*<img src=\{resource\.img\} alt=\{resource\.title\} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" \/>\s*<\/div>\s*<div className="p-5 flex-1">\s*<h3 className="font-bold text-lg mb-3">\{resource\.title\}<\/h3>\s*<p className="text-sm text-slate-300 leading-relaxed line-clamp-4">\{resource\.desc\}<\/p>\s*<\/div>\s*<\/Link>\s*\)\)\}/m;

c = c.replace(contentStartRegex, replaceContent);

fs.writeFileSync('components/landing/LandingPage.tsx', c);
console.log("updated landing page top resources");
