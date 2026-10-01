import fs from 'fs';
let code = fs.readFileSync('frontend/src/pages/Reports.jsx', 'utf8');

code = code.replace(
  `        </div>
      </div>
      </div>

    {tab === 'Summary'`,
  `        </div>
      </div>

    {tab === 'Summary'`
);

fs.writeFileSync('frontend/src/pages/Reports.jsx', code);
