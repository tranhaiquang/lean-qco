# QCO INTELLIGENCE DASHBOARD (MINIMALIST EDITION)
**Vietnam Samho Co., Ltd. • Lean Manufacturing & TPM Division**

Giao diện Web Dashboard quản trị dữ liệu Quick Changeover (QCO) được tái thiết kế theo triết lý:
- **Ponytail (YAGNI & Anti-Bloat):** Cắt giảm 100% các thành phần rườm rà, tập trung tuyệt đối vào những chỉ số và đồ thị cốt lõi mà kỹ sư xưởng và cấp quản lý cần.
- **Taste Skill (Linear / Scandinavian Aesthetics):** Phong cách thiết kế tối giản cao cấp, tỷ lệ tín hiệu trên nhiễu (Signal-to-Noise Ratio) tối đa, bảng màu trung tính nhã nhặn, con số rõ ràng với font monospaced tabular figures.

---

## ⚡ Các khu vực chức năng chính

1. **Header & Navigation tối giản:**
   - Logo nhà máy + Nhãn định danh hệ thống.
   - Bộ chuyển đổi xưởng dạng Segmented Pill: `All Processes`, `ATOM`, `AUTOCUT`, `OUTSOLE`, `PRINTING`, `SEMI`, `STITCHING`.
   - Bộ lọc tinh gọn ngay trên thanh điều hướng: Chọn năm, Chọn loại C/O (Planned/Unplanned), và Tìm kiếm mã Model.
   - Nút nạp CSV mới, xuất CSV và chuyển đổi Theme Sáng/Tối.

2. **Dải 4 Chỉ số KPI cốt lõi (Core Metric Strip):**
   - **Actual COT:** Thời gian chuyển đổi mã trung bình thực tế (kèm độ lệch so với chuẩn).
   - **Target COPT:** Mục tiêu định mức kỹ thuật kế hoạch.
   - **Adherence Rate:** Tỉ lệ đạt chuẩn (`COT ≤ COPT`) kèm số lượng lần đạt trên tổng số sự kiện.
   - **Changeover Cost:** Tổng chi phí C/O thực tế và chi phí phát sinh ngoài kế hoạch.

3. **Lưới trực quan hóa dữ liệu (Primary Visuals):**
   - **Monthly Performance Trend (2/3 chiều rộng):** Biểu đồ cột thể hiện COT thực tế theo từng tháng kết hợp đường đứt nét COPT mục tiêu.
   - **Type Split (1/3 chiều rộng):** Donut phân tách số lượng và chi phí giữa Planned & Unplanned.
   - **Top Focus Models:** Biểu đồ thanh ngang tối giản thể hiện các mã model có COT cao nhất cần ưu tiên Kaizen.

4. **Bảng nhật ký chuyển đổi mã (Changeover Records):**
   - Bảng hiển thị sắc nét từng lần chuyển đổi: Ngày, Xưởng, Model trước, Model sau, COT, COPT, Chênh lệch (Variance), Phân loại, Lý do và Chi phí.
   - Sắp xếp cột nhanh, phân trang gọn gàng.

---

## 🚀 Cách mở ứng dụng
Nhấp đúp chuột vào file:
`C:\Users\LEAN15\Desktop\qco-dashboard\index.html`
hoặc khởi chạy `serve.bat` để chạy qua local server.
# lean-qco
