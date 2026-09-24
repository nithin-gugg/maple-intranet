const fs = require('fs');
let c = fs.readFileSync('components/landing/LandingPage.tsx', 'utf8');
c = c.replace(
  /<h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Company Calendar<\/h2>\r?\n\s*<\/div>/,
  `<h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Company Calendar</h2>
              </div>
              {user && (
                <button
                  onClick={handleConnectGoogle}
                  disabled={isGoogleConnected}
                  className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium text-sm whitespace-nowrap mb-6 -mt-2"
                >
                  {isGoogleConnected ? (
                    <>
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Google Workspace Connected
                    </>
                  ) : (
                    <>
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                      Connect Google Workspace
                    </>
                  )}
                </button>
              )}`
);
c = c.replace(/<CalendarWidget \/>/g, '<CalendarWidget isGoogleConnected={isGoogleConnected} userToken={userToken} />');
fs.writeFileSync('components/landing/LandingPage.tsx', c);
console.log("Updated");
