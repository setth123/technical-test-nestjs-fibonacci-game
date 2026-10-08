// Tiện ích dùng chung cho các trang
const auth = {
  get token() { return localStorage.getItem('token'); },
  set token(v) { v ? localStorage.setItem('token', v) : localStorage.removeItem('token'); },
};

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth.token && { Authorization: `Bearer ${auth.token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error([].concat(data.message || res.statusText).join(', '));
  return data;
}

// Trang game yêu cầu đăng nhập
function requireLogin() {
  if (!auth.token) location.href = '/';
}
