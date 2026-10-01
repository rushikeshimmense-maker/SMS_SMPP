import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/AppLayout.jsx', 'utf8');

code = code.replace(
  "import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'",
  "import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'"
);

fs.writeFileSync('frontend/src/components/AppLayout.jsx', code);
