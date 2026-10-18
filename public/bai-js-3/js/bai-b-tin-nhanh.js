/* BÀI B — VIẾT CODE: Lọc tin và đăng tin nhanh (news.html)
   Viết code theo đặc tả.
   Không sửa news.html, không sửa css; chỉ viết JavaScript trong file này. */

// ---------- ĐÃ CHO SẴN (không sửa) ----------
// Chặn việc gửi form tìm kiếm khi nhấn Enter, để trang không bị tải lại.
document.querySelector("#searchbar form").addEventListener("submit", (e) => e.preventDefault());

// ---------- PHẦN BẠN VIẾT ----------

const dsTin = document.getElementById("list");
const oTim = document.getElementById("o-tim-kiem");
const boDem = document.getElementById("bo-dem");
const khongThay = document.getElementById("khong-thay");
const oTieuDe = document.getElementById("tin-tieu-de");
const oNoiDung = document.getElementById("tin-noi-dung");
const nutDang = document.getElementById("nut-dang");
const baoLoi = document.getElementById("bao-loi");

// Một tin có khớp từ khoá không: tìm trong tiêu đề và nội dung, không phân biệt hoa thường.
function tinKhop(muc, tuKhoa) {
	const vanBan = muc.querySelector("h3").textContent + " " + muc.querySelector("p").textContent;
	return vanBan.toLowerCase().includes(tuKhoa.toLowerCase());
}

// F1 + F2 + F3. Lọc tin theo từ khoá, cập nhật bộ đếm và thông báo #khong-thay.
function locTin() {
	const tuKhoa = oTim.value;
	const dsMuc = dsTin.querySelectorAll("li");
	let soHien = 0;
	for (const muc of dsMuc) {
		const hien = tinKhop(muc, tuKhoa);
		muc.classList.toggle("an", !hien);
		if (hien) {
			soHien++;
		}
	}
	boDem.textContent = `Đang hiển thị ${soHien}/${dsMuc.length} tin`;
	khongThay.textContent = soHien === 0 ? `Không tìm thấy tin nào cho "${tuKhoa}"` : "";
	khongThay.classList.toggle("an", soHien !== 0);
}

// F2 + F3. Lọc khi người dùng gõ vào ô tìm kiếm.
oTim.addEventListener("keyup", locTin);

// F4. Nút "Read more >>" / "Thu gọn <<" — MỘT trình lắng nghe đặt trên #list.
dsTin.addEventListener("click", (e) => {
	const nut = e.target.closest("button.more");
	if (nut === null) {
		return;
	}
	const doan = nut.closest("li").querySelector("p");
	const mo = doan.classList.toggle("day-du");
	nut.textContent = mo ? "Thu gọn <<" : "Read more >>";
});

// F5. Nút #nut-dang: kiểm tra dữ liệu, tạo <li> mới, chèn vào đầu #list.
nutDang.addEventListener("click", () => {
	const tieuDe = oTieuDe.value;
	const noiDung = oNoiDung.value;
	if (tieuDe === "" || noiDung === "") {
		baoLoi.textContent = "Vui lòng nhập đủ tiêu đề và nội dung.";
		return;
	}

	const muc = document.createElement("li");
	const time = document.createElement("span");
	time.className = "time";
	time.textContent = homNay();
	const h3 = document.createElement("h3");
	h3.textContent = tieuDe;
	const doan = document.createElement("p");
	doan.textContent = noiDung;
	const nut = document.createElement("button");
	nut.type = "button";
	nut.className = "more";
	nut.textContent = "Read more >>";
	muc.append(time, h3, doan, nut);
	dsTin.prepend(muc);

	oTieuDe.value = "";
	oNoiDung.value = "";
	baoLoi.textContent = "";
	locTin();
});

// Hiển thị bộ đếm ngay khi mở trang.
locTin();
