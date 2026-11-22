const { useCallback, useEffect, useRef, useState } = React;
const usersUrl = "https://jsonplaceholder.typicode.com/users";

const emptyUser = {
  name: "", username: "", email: "", phone: "", website: "",
  address: { street: "", suite: "", city: "" },
};

function SearchForm({ onChangeValue }) {
  return (
    <label className="search">
      Tìm người dùng
      <input type="search" placeholder="Họ tên hoặc tên đăng nhập"
        onChange={(event) => onChangeValue(event.target.value)} />
    </label>
  );
}

function UserForm({ title, user, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...user, address: { ...user.address } }));
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    event.target.setCustomValidity("");
    setDraft((previous) => Object.hasOwn(previous.address, name)
      ? { ...previous, address: { ...previous.address, [name]: value } }
      : { ...previous, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    for (const name of ["name", "username"]) {
      if (!draft[name].trim()) {
        const input = event.currentTarget.elements.namedItem(name);
        input.setCustomValidity("Vui lòng nhập nội dung cho trường này.");
        input.reportValidity();
        return;
      }
    }
    onSave({ ...draft, name: draft.name.trim(), username: draft.username.trim() });
  }

  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="form-title">
      <form onSubmit={handleSubmit}>
        <h2 id="form-title">{title}</h2>
        <p className="muted">Các trường có dấu * là bắt buộc.</p>
        <div className="form-grid">
          <label>Họ tên *<input name="name" value={draft.name} onChange={handleChange} required autoFocus /></label>
          <label>Tên đăng nhập *<input name="username" value={draft.username} onChange={handleChange} required /></label>
          <label>Email<input name="email" type="email" value={draft.email} onChange={handleChange} /></label>
          <label>Điện thoại<input name="phone" type="tel" value={draft.phone} onChange={handleChange} /></label>
          <label className="wide">Website<input name="website" value={draft.website} onChange={handleChange} /></label>
        </div>
        <fieldset>
          <legend>Địa chỉ</legend>
          <div className="form-grid">
            <label>Đường<input name="street" value={draft.address.street} onChange={handleChange} /></label>
            <label>Căn hộ<input name="suite" value={draft.address.suite} onChange={handleChange} /></label>
            <label className="wide">Thành phố<input name="city" value={draft.address.city} onChange={handleChange} /></label>
          </div>
        </fieldset>
        <div className="form-actions">
          <button type="button" onClick={onClose}>Hủy</button>
          <button className="primary" type="submit">{user.id === undefined ? "Thêm" : "Lưu thay đổi"}</button>
        </div>
      </form>
    </dialog>
  );
}

function AddUser({ onAdd, disabled }) {
  const [adding, setAdding] = useState(false);
  return (
    <>
      <button className="primary" disabled={disabled} onClick={() => setAdding(true)}>+ Thêm người dùng</button>
      {adding && <UserForm title="Thêm người dùng" user={emptyUser}
        onSave={(user) => { onAdd(user); setAdding(false); }}
        onClose={() => setAdding(false)} />}
    </>
  );
}

function ResultTable({ keyword, user, onAdded, loadState, onLoadState }) {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const request = new AbortController();
    async function loadUsers() {
      try {
        const response = await fetch(usersUrl, { signal: request.signal });
        if (!response.ok) throw new Error("Không tải được danh sách.");
        setUsers(await response.json());
        onLoadState("ready");
      } catch (error) {
        if (!request.signal.aborted) onLoadState("error");
      }
    }
    loadUsers();
    return () => request.abort();
  }, [onLoadState]);

  useEffect(() => {
    if (!user) return;
    setUsers((previous) => {
      const id = previous.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [...previous, { ...user, id }];
    });
    setNotice(`Đã thêm ${user.name}.`);
    onAdded();
  }, [user, onAdded]);

  function saveUser(updated) {
    setUsers((previous) => previous.map((item) => item.id === updated.id ? updated : item));
    setEditing(null);
    setNotice(`Đã lưu thay đổi cho ${updated.name}.`);
  }

  function removeUser(item) {
    setUsers((previous) => previous.filter((entry) => entry.id !== item.id));
    setNotice(`Đã xóa ${item.name}.`);
  }

  if (loadState === "loading") return <p role="status">Đang tải danh sách người dùng…</p>;
  if (loadState === "error") {
    return <p role="alert">Không tải được danh sách từ JSONPlaceholder. Hãy tải lại trang để thử lại.</p>;
  }

  const query = keyword.trim().toLowerCase();
  const filteredUsers = users.filter((item) =>
    item.name.toLowerCase().includes(query) || item.username.toLowerCase().includes(query));

  return (
    <section aria-labelledby="list-title">
      <div className="list-heading">
        <h2 id="list-title">Danh sách người dùng</h2>
        <span role="status">{filteredUsers.length} / {users.length} người dùng</span>
      </div>
      <p className="notice" role="status">{notice}</p>
      <div className="table-scroll" tabIndex={0} role="region" aria-labelledby="list-title">
        <table>
          <thead>
            <tr>
              {["ID", "Họ tên / Tên đăng nhập", "Email", "Địa chỉ", "Điện thoại", "Thao tác"].map((label) =>
                <th key={label} scope="col">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <th scope="row">{item.name}<small>{item.username}</small></th>
                <td>{item.email || "—"}</td>
                <td>{[item.address.street, item.address.suite, item.address.city].filter(Boolean).join(", ") || "—"}</td>
                <td>{item.phone || "—"}</td>
                <td className="row-actions">
                  <button aria-label={`Sửa ${item.name}`} onClick={() => setEditing(item)}>Sửa</button>
                  <button className="delete" aria-label={`Xóa ${item.name}`} onClick={() => removeUser(item)}>Xóa</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={6}>{query ? "Không tìm thấy người dùng phù hợp." : "Danh sách chưa có người dùng."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {editing && <UserForm title="Sửa người dùng" user={editing}
        onSave={saveUser} onClose={() => setEditing(null)} />}
    </section>
  );
}

function App() {
  const [keyword, setKeyword] = useState("");
  const [newUser, setNewUser] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const clearNewUser = useCallback(() => setNewUser(null), []);

  return (
    <>
      <h1>Quản lý người dùng</h1>
      <p className="intro">Dữ liệu mẫu từ JSONPlaceholder. Thay đổi được lưu trong phiên hiện tại và sẽ mất khi tải lại trang.</p>
      <div className="toolbar">
        <SearchForm onChangeValue={setKeyword} />
        <AddUser onAdd={setNewUser} disabled={loadState !== "ready"} />
      </div>
      <ResultTable keyword={keyword} user={newUser} onAdded={clearNewUser}
        loadState={loadState} onLoadState={setLoadState} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
