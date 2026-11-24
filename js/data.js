/* ParallelLab — dữ liệu bài học: nền tảng lập trình song song */
window.PARALLELLAB = window.PARALLELLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };

(function () {
  var T = window.PARALLELLAB;

  T.modules.push({
    id: "nen-tang-song-song",
    num: "01",
    title: "Nền tảng song song",
    tone: "blue",
    blurb: "Bốn bài dựng nền: phân biệt luồng với tiến trình, nhận diện tranh chấp dữ liệu khi hai luồng cùng ghi, dùng khóa đúng độ rộng và chuyển sang thao tác nguyên tử khi khóa quá tay. Mỗi bài có sơ đồ, số đo và checklist ngắn để áp dụng vào mã thật.",
    lessons: ["luong", "tranh-chap", "khoa", "atomic"]
  });

  T.lessons["luong"] = {
    id: "luong",
    module: "nen-tang-song-song",
    title: "Luồng và tiến trình",
    shortTitle: "Luồng và tiến trình",
    subtitle: "Chung bộ nhớ hay riêng không gian nhớ",
    blurb: "Luồng là đơn vị chạy nhẹ, chia sẻ bộ nhớ trong cùng tiến trình; tiến trình sở hữu không gian nhớ riêng. Bài này so sánh chi phí tạo, cách lịch chạy xen kẽ và vì sao dữ liệu dùng chung cần được bảo vệ.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["luồng", "tiến trình", "bộ nhớ chia sẻ", "lịch chạy", "chi phí tạo"],
    metrics: [
      { key: "threads", label: "Số luồng", tone: "blue" },
      { key: "procs", label: "Số tiến trình", tone: "mint" },
      { key: "createMs", label: "Chi phí tạo", tone: "yellow" },
      { key: "shared", label: "Nhớ chia sẻ", tone: "coral" }
    ],
    nodes: [
      { id: "app", type: "page", x: 55, y: 80, w: 200, h: 70, label: "Chương trình", sub: "tệp thực thi trên đĩa" },
      { id: "proc", type: "server", x: 340, y: 80, w: 200, h: 70, label: "Tiến trình", sub: "không gian nhớ riêng" },
      { id: "thread", type: "task", x: 625, y: 80, w: 200, h: 70, label: "Luồng công nhân", sub: "bốn luồng giải mã ảnh" },
      { id: "heap", type: "memory", x: 55, y: 310, w: 200, h: 70, label: "Bộ nhớ chia sẻ", sub: "heap và biến toàn cục" },
      { id: "sched", type: "clock", x: 340, y: 310, w: 200, h: 70, label: "Lịch chạy CPU", sub: "chia lát thời gian" },
      { id: "cost", type: "bolt", x: 625, y: 310, w: 200, h: 70, label: "Bảng đo chi phí", sub: "luồng 0,05 ms" },
      { id: "stack", type: "layers", x: 340, y: 195, w: 200, h: 70, label: "Ngăn xếp riêng", sub: "mỗi luồng một stack" }
    ],
    edges: [
      { id: "app-proc", from: "app", to: "proc", kind: "request", label: "khởi chạy" },
      { id: "proc-thread", from: "proc", to: "thread", kind: "control", label: "sinh bốn luồng" },
      { id: "thread-heap", from: "thread", to: "heap", kind: "data", label: "đọc ghi chung" },
      { id: "proc-stack", from: "proc", to: "stack", kind: "control", label: "cấp stack riêng" },
      { id: "thread-sched", from: "thread", to: "sched", kind: "control", label: "xin CPU", bow: 22 },
      { id: "sched-thread", from: "sched", to: "thread", kind: "data", label: "chạy 3 ms", bow: -22 },
      { id: "sched-cost", from: "sched", to: "cost", kind: "data", label: "ghi 0,05 ms" }
    ],
    learn: [
      "<strong>Luồng</strong> chia sẻ heap, biến toàn cục và mã lệnh với anh em cùng tiến trình.",
      "<strong>Tiến trình</strong> có không gian địa chỉ riêng, muốn chia dữ liệu phải qua ống hoặc socket.",
      "Tạo luồng tốn khoảng <code>0,05 ms</code>, tạo tiến trình tốn vài mili giây.",
      "<strong>Lịch chạy</strong> xen kẽ không đoán trước, đừng giả định thứ tự thực thi."
    ],
    steps: [
      {
        short: "Tiến trình là gì",
        type: "concept",
        title: "Một tiến trình, ít nhất một luồng",
        body: "Khi bạn chạy một tệp thực thi, hệ điều hành tạo một tiến trình: không gian địa chỉ riêng, bảng tệp mở riêng và ít nhất một luồng chính chạy <code>main</code>. Tiến trình là đơn vị cấp phát tài nguyên, còn luồng là đơn vị được lịch chạy. Hai tiến trình muốn trao đổi dữ liệu phải qua ống, socket hoặc vùng nhớ chia sẻ, mỗi lần đều tốn sao chép. Trong cùng một tiến trình, mọi luồng nhìn thấy chung heap và biến toàn cục, nên dùng lại dữ liệu rất tiện. Cái giá là một luồng ghi sai ô nhớ thì luồng khác đọc ngay giá trị hỏng. Trình duyệt ảnh mở một tiến trình, bên trong là bốn luồng giải mã song song.",
        focus: ["app", "proc", "thread"],
        edges: ["app-proc", "proc-thread"],
        metrics: { threads: "1", procs: "1", createMs: "0", shared: "Không" },
        changes: [
          "Tệp thực thi trở thành tiến trình có không gian nhớ riêng.",
          "Ít nhất một luồng chính bắt đầu chạy mã của hàm main."
        ],
        note: "Tiến trình là thùng chứa tài nguyên; luồng mới là thứ chạy trên lõi."
      },
      {
        short: "Chung vùng nhớ",
        type: "flow",
        title: "Luồng nhìn chung heap, riêng ngăn xếp",
        body: "Bốn luồng giải mã ảnh cùng đọc một mảng byte đầu vào và ghi vào bốn vùng đệm khác nhau. Chúng chia sẻ heap, biến toàn cục và mã lệnh, nên không phải sao chép 50 MB ảnh cho từng luồng, tiết kiệm cả bộ nhớ lẫn băng thông. Đổi lại, mỗi luồng có ngăn xếp riêng khoảng 1 MB để chứa biến cục bộ và lời gọi hàm, nhờ vậy đệ quy của luồng này không giẫm lên luồng kia. Ranh giới mong manh nằm ở con trỏ: hai luồng cùng giữ địa chỉ của một biến đếm thì mọi phép cộng đều chạm cùng ô nhớ. Chia vùng đệm theo chỉ số luồng là cách rẻ nhất để tránh chạm trán.",
        focus: ["thread", "heap", "stack"],
        edges: ["proc-thread", "thread-heap", "proc-stack"],
        metrics: { threads: "4", procs: "1", createMs: "0,05", shared: "Có" },
        changes: [
          "Ảnh 50 MB chỉ nằm một bản trong heap, bốn luồng cùng trỏ tới.",
          "Mỗi luồng nhận một ngăn xếp 1 MB riêng cho biến cục bộ."
        ],
        note: "Chia dữ liệu theo chỉ số luồng trước khi nghĩ tới chuyện khóa."
      },
      {
        short: "Chi phí tạo",
        type: "detail",
        title: "Tạo luồng rẻ, tạo tiến trình đắt",
        body: "Trên Linux, một luồng POSIX mất khoảng <code>0,05 ms</code> để tạo vì chỉ cần thêm ngăn xếp và một mục trong bảng lịch chạy; tiến trình mất vài mili giây vì phải dựng không gian địa chỉ mới. Nhưng rẻ không có nghĩa là miễn phí: mỗi lần chuyển ngữ cảnh giữa hai luồng tốn khoảng 2 đến 5 micro giây, và hàng nghìn luồng nhỏ sẽ đẩy chi phí đó lên. Với tác vụ 20 micro giây, tạo luồng cho từng mục là lỗ. Hãy dùng bể luồng có sẵn, kích thước xấp xỉ số lõi vật lý, và tái sử dụng. Quy tắc thực dụng: việc nặng, chạy lâu thì tách tiến trình; việc nhẹ, lặp nhiều thì gom vào bể luồng.",
        focus: ["thread", "cost", "sched"],
        edges: ["thread-sched", "sched-cost", "sched-thread"],
        metrics: { threads: "4", procs: "1", createMs: "0,05", shared: "Có" },
        changes: [
          "Tạo 4 luồng tốn tổng cộng khoảng 0,2 ms, không đáng kể.",
          "Chuyển sang bể luồng cố định thay vì sinh luồng mỗi ảnh."
        ],
        note: "Đo trước khi tối ưu: 0,05 ms mỗi luồng vẫn nhân lên theo số ảnh."
      },
      {
        short: "Lịch chạy",
        type: "pitfall",
        title: "Lịch chạy không hứa thứ tự nào",
        body: "Giả sử luồng A ghi <code>san_sang = 1</code> rồi mới đổ dữ liệu vào bộ đệm, luồng B chờ thấy cờ rồi đọc bộ đệm. Trên giấy thứ tự rất rõ, nhưng bộ xử lý và trình biên dịch được phép đảo thao tác, còn lịch chạy có thể cắt A ngay sau khi ghi cờ. B đọc được cờ nhưng bộ đệm vẫn rỗng, chương trình sai ngẫu nhiên, chạy lại thì hết. Đừng sửa bằng cách thêm <code>sleep</code>: nó chỉ làm lỗi hiếm hơn. Cần hàng rào bộ nhớ hoặc biến đồng bộ có thứ tự, như <code>atomic</code> với thứ tự nhả nhận. Nguyên tắc: nếu hai luồng chia sẻ dữ liệu, mọi giả định về thứ tự phải được viết thành mã.",
        focus: ["thread", "sched", "heap"],
        edges: ["thread-sched", "sched-thread", "thread-heap"],
        metrics: { threads: "4", procs: "1", createMs: "0,05", shared: "Có" },
        changes: [
          "Bỏ giả định A chạy trước B, thêm hàng rào bộ nhớ giữa hai bước.",
          "Lỗi ngẫu nhiên biến mất khi chạy lại 1.000 lần."
        ],
        note: "Sleep không phải công cụ đồng bộ, chỉ là cách che lỗi tạm thời."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Chọn luồng hay tiến trình",
        body: "Tổng kết bằng một checklist bốn dòng. Một: dữ liệu có cần chia sẻ dày đặc không, nếu có thì luồng tiện hơn vì không phải sao chép. Hai: có cần cô lập để một thành phần chết không kéo cả hệ thống không, nếu có thì tách tiến trình. Ba: tác vụ kéo dài bao lâu, dưới 100 micro giây thì đừng tạo luồng mới cho từng mục. Bốn: số luồng nên xấp xỉ số lõi vật lý, không phải số tác vụ. Với trình giải mã ảnh, bốn luồng trong một tiến trình là đúng: ảnh nằm chung heap, mỗi luồng một vùng đệm, và lỗi giải mã một ảnh không làm sập cả chương trình nếu bạn bắt ngoại lệ đúng chỗ.",
        focus: "all",
        edges: "all",
        metrics: { threads: "4", procs: "1", createMs: "0,05", shared: "Có" },
        changes: [
          "Chốt kiến trúc: một tiến trình, bốn luồng, chia vùng đệm theo chỉ số.",
          "Bể luồng giữ kích thước cố định bằng số lõi vật lý."
        ],
        note: "Số luồng bám số lõi, số tác vụ chỉ quyết định kích thước hàng đợi.",
        tone: "final"
      }
    ]
  };

  T.lessons["tranh-chap"] = {
    id: "tranh-chap",
    module: "nen-tang-song-song",
    title: "Tranh chấp dữ liệu",
    shortTitle: "Tranh chấp dữ liệu",
    subtitle: "Khi hai luồng cùng ghi một biến",
    blurb: "Hai luồng cùng cộng một biến đếm là ví dụ nhỏ nhất của tranh chấp dữ liệu. Bài này bóc tách ba bước máy của phép cộng, cho thấy kết quả phụ thuộc lịch chạy và vì sao đếm 10.000 lần lại thiếu vài trăm.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["tranh chấp dữ liệu", "race condition", "đọc ghi", "lịch chạy", "đồng bộ"],
    metrics: [
      { key: "threads", label: "Số luồng", tone: "blue" },
      { key: "writes", label: "Lần cộng", tone: "mint" },
      { key: "lostUpdates", label: "Lần mất", tone: "coral" },
      { key: "ok", label: "Kết quả đúng", tone: "yellow" }
    ],
    nodes: [
      { id: "ta", type: "task", x: 55, y: 80, w: 200, h: 70, label: "Luồng A", sub: "đọc rồi cộng một" },
      { id: "tb", type: "task", x: 340, y: 80, w: 200, h: 70, label: "Luồng B", sub: "đọc cùng lúc" },
      { id: "dem", type: "memory", x: 625, y: 80, w: 200, h: 70, label: "Biến đếm đơn hàng", sub: "don_hang = 41" },
      { id: "old", type: "alert", x: 55, y: 310, w: 200, h: 70, label: "Giá trị cũ", sub: "cả hai đọc 41" },
      { id: "over", type: "alert", x: 340, y: 310, w: 200, h: 70, label: "Ghi đè", sub: "mất một lần cộng" },
      { id: "final", type: "check", x: 625, y: 310, w: 200, h: 70, label: "Kết quả cuối", sub: "9.688 thay vì 10.000" },
      { id: "sched", type: "clock", x: 340, y: 195, w: 200, h: 70, label: "Lịch chạy xen kẽ", sub: "thứ tự đổi mỗi lần" }
    ],
    edges: [
      { id: "ta-dem", from: "ta", to: "dem", kind: "data", label: "đọc 41" },
      { id: "tb-dem", from: "tb", to: "dem", kind: "data", label: "đọc 41" },
      { id: "dem-old", from: "dem", to: "old", kind: "data", label: "trả 41" },
      { id: "old-over", from: "old", to: "over", kind: "control", label: "cả hai ghi 42" },
      { id: "over-final", from: "over", to: "final", kind: "data", label: "thiếu 312" },
      { id: "sched-ta", from: "sched", to: "ta", kind: "control", label: "cắt giữa chừng" },
      { id: "sched-tb", from: "sched", to: "tb", kind: "control", label: "chen vào" }
    ],
    learn: [
      "<strong>Tranh chấp</strong> xảy ra khi hai luồng cùng đọc rồi ghi một biến mà không đồng bộ.",
      "Phép <code>dem += 1</code> gồm ba bước: nạp, cộng, ghi, và có thể bị chen giữa.",
      "Kết quả phụ thuộc <strong>lịch chạy</strong>: cùng mã cho 9.688 hay 9.903 lần.",
      "Khóa hoặc biến nguyên tử gộp ba bước thành một thao tác không chia cắt."
    ],
    steps: [
      {
        short: "Hai luồng, một biến",
        type: "concept",
        title: "Phép cộng không phải một bước",
        body: "Kho hàng có một biến đếm số đơn đã xử lý, hai luồng cùng cộng thêm một sau mỗi đơn. Nhìn qua thì đúng: mỗi luồng lặp 5.000 lần, tổng phải là 10.000. Nhưng phép <code>dem += 1</code> không phải một bước, nó là ba bước máy: nạp giá trị từ bộ nhớ vào thanh ghi, cộng một, rồi ghi lại. Giữa ba bước đó, lịch chạy được phép cắt luồng A và cho B chạy. Khi cả hai cùng nạp 41, cả hai cùng ghi 42, và một lần cộng biến mất. Đây là tranh chấp dữ liệu, không phải lỗi cú pháp, nên trình biên dịch không hề cảnh báo.",
        focus: ["ta", "tb", "dem"],
        edges: ["ta-dem", "tb-dem"],
        metrics: { threads: "2", writes: "10.000", lostUpdates: "0", ok: "Chưa đo" },
        changes: [
          "Xác định biến đếm là tài nguyên dùng chung giữa hai luồng.",
          "Phép cộng được nhìn nhận là ba bước, không phải một."
        ],
        note: "Trình biên dịch không báo lỗi tranh chấp; chỉ đo mới thấy."
      },
      {
        short: "Xen kẽ",
        type: "flow",
        title: "Một khe hẹp đủ làm mất một lần",
        body: "Đi theo từng bước của một lần xen kẽ. Luồng A nạp biến đếm, được 41. Trước khi A kịp ghi, lịch chạy chuyển sang B, B cũng nạp 41. A ghi 42, B ghi 42. Hai lần cộng chỉ còn một kết quả, biến đếm lẽ ra 43 nhưng vẫn 42. Một lần mất là chuyện nhỏ, nhưng 5.000 vòng lặp mỗi luồng nhân với xác suất xen kẽ đúng chỗ cho ra vài trăm lần mất. Đáng chú ý là không cần hai luồng chạy đúng cùng một nano giây: chỉ cần khe giữa bước nạp và bước ghi đủ rộng. Trên máy nhiều lõi, khe đó rộng hơn bạn tưởng.",
        focus: ["ta", "tb", "old", "over"],
        edges: ["ta-dem", "tb-dem", "dem-old", "old-over"],
        metrics: { threads: "2", writes: "10.000", lostUpdates: "1", ok: "Không" },
        changes: [
          "Hai luồng cùng giữ giá trị 41 trong thanh ghi.",
          "Hai lần ghi 42 trùng nhau, một lần cộng bị nuốt."
        ],
        note: "Chỉ cần một khe giữa nạp và ghi, không cần chạy song song hoàn hảo."
      },
      {
        short: "Thiếu 312 lần",
        type: "detail",
        title: "Đếm 10.000 lần còn 9.688",
        body: "Chạy thử trên máy 8 lõi: hai luồng, mỗi luồng 5.000 vòng, kết quả 9.688. Thiếu 312 lần, tức khoảng 3,1 phần trăm. Con số này không cố định: lần chạy sau có thể ra 9.741 hoặc 9.903, vì nó phụ thuộc tải CPU và vị trí cắt của bộ định thời. Nếu bạn chỉ thử một lần rồi kết luận mã đúng, bạn đã bỏ qua lỗi. Cách phát hiện: chạy 100 lần và so với kết quả tuần tự, hoặc dùng công cụ như ThreadSanitizer. Cách sửa có hai hướng, bọc khóa quanh ba bước, hoặc dùng biến nguyên tử với <code>fetch_add</code>.",
        focus: ["dem", "over", "final"],
        edges: ["old-over", "over-final"],
        metrics: { threads: "2", writes: "10.000", lostUpdates: "312", ok: "Không" },
        changes: [
          "Kết quả ghi nhận 9.688 thay vì 10.000.",
          "Sai lệch khoảng 3,1 phần trăm, thay đổi theo từng lần chạy."
        ],
        note: "Một lần chạy đúng không chứng minh mã đúng; hãy chạy 100 lần."
      },
      {
        short: "Đừng chữa mẹo",
        type: "pitfall",
        title: "Sleep và cờ tự chế đều không cứu",
        body: "Phản xạ đầu tiên của nhiều người là chèn <code>sleep(1)</code> giữa đọc và ghi, thấy kết quả đúng rồi yên tâm. Đó là ảo giác: sleep chỉ làm khe xen kẽ hẹp lại trên máy thử, còn trên máy chủ 32 lõi lỗi quay lại, thường đúng vào lúc cao điểm. Một biến thể khác là dùng cờ boolean tự chế, cũng hỏng vì bản thân cờ cũng cần đồng bộ. Chỉ có hai công cụ đúng: khóa loại trừ tương hỗ hoặc thao tác nguyên tử do phần cứng bảo đảm. Ngoài ra hãy soát cả những chỗ ít ngờ như bộ đếm thống kê, bộ nhớ đệm dùng chung và vòng ghi log từ nhiều luồng.",
        focus: ["sched", "ta", "tb"],
        edges: ["sched-ta", "sched-tb"],
        metrics: { threads: "2", writes: "10.000", lostUpdates: "312", ok: "Không" },
        changes: [
          "Bỏ sleep, thay bằng khóa quanh đoạn đọc-cộng-ghi.",
          "Soát thêm bộ đếm thống kê và bộ nhớ đệm dùng chung."
        ],
        note: "Sleep chỉ đổi xác suất, không tạo ra bảo đảm nào."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Bốn câu hỏi trước khi chạy song song",
        body: "Bốn câu hỏi trước khi viết vòng lặp song song. Một: biến này có được hai luồng ghi không, nếu chỉ đọc thì yên tâm. Hai: phép cập nhật có cần trọn vẹn không, nếu có thì bọc khóa hoặc dùng <code>atomic</code>. Ba: có chỗ nào đọc biến đó để quyết định luồng khác không, ví dụ cờ dừng, thì cũng phải đồng bộ. Bốn: đã chạy thử nhiều lần và so với kết quả tuần tự chưa. Với bài toán đơn hàng, đổi sang biến nguyên tử cho kết quả đúng 10.000 trong 100 lần chạy, không cần khóa, vì chỉ có một phép cộng.",
        focus: "all",
        edges: "all",
        metrics: { threads: "2", writes: "10.000", lostUpdates: "0", ok: "Có" },
        changes: [
          "Chuyển bộ đếm sang biến nguyên tử, kết quả đúng 10.000.",
          "Thêm bài kiểm tra chạy 100 lần so với bản tuần tự."
        ],
        note: "Chỉ một phép cộng thì nguyên tử đủ; nhiều bước thì cần khóa.",
        tone: "final"
      }
    ]
  };

  T.lessons["khoa"] = {
    id: "khoa",
    module: "nen-tang-song-song",
    title: "Khóa và vùng găng",
    shortTitle: "Khóa và vùng găng",
    subtitle: "Giữ khóa đúng độ rộng và đúng thứ tự",
    blurb: "Mutex bảo vệ vùng găng, nhưng khóa quá rộng thì tám luồng chạy như một. Bài này đo thông lượng trước và sau khi thu hẹp vùng găng, rồi bàn cách đặt thứ tự khóa để không tự tạo deadlock.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["mutex", "vùng găng", "thông lượng", "deadlock", "thứ tự khóa"],
    metrics: [
      { key: "lockPct", label: "Thời gian khóa", tone: "blue" },
      { key: "waitMs", label: "Chờ mỗi ảnh", tone: "yellow" },
      { key: "throughput", label: "Thông lượng", tone: "mint" },
      { key: "ok", label: "Đạt mục tiêu", tone: "coral" }
    ],
    nodes: [
      { id: "pool", type: "task", x: 55, y: 80, w: 200, h: 70, label: "Tám luồng xử lý", sub: "cùng gọi một hàm" },
      { id: "mutex", type: "key", x: 340, y: 80, w: 200, h: 70, label: "Mutex", sub: "một luồng vào một lúc" },
      { id: "critical", type: "shield", x: 625, y: 80, w: 200, h: 70, label: "Vùng găng", sub: "mười dòng cập nhật" },
      { id: "queue", type: "queue", x: 55, y: 310, w: 200, h: 70, label: "Hàng đợi khóa", sub: "bảy luồng đứng chờ" },
      { id: "wait", type: "clock", x: 340, y: 310, w: 200, h: 70, label: "Thời gian chờ", sub: "120 ms mỗi ảnh" },
      { id: "rate", type: "signal", x: 625, y: 310, w: 200, h: 70, label: "Thông lượng", sub: "1.200 ảnh mỗi giờ" },
      { id: "wide", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "Khóa quá rộng", sub: "bọc cả hàm 80 ms" }
    ],
    edges: [
      { id: "pool-mutex", from: "pool", to: "mutex", kind: "request", label: "xin khóa", bow: 22 },
      { id: "mutex-pool", from: "mutex", to: "pool", kind: "response", label: "nhả khóa", bow: -22 },
      { id: "mutex-critical", from: "mutex", to: "critical", kind: "control", label: "vào vùng găng" },
      { id: "pool-queue", from: "pool", to: "queue", kind: "request", label: "xếp hàng chờ" },
      { id: "queue-wait", from: "queue", to: "wait", kind: "data", label: "cộng dồn 120 ms" },
      { id: "critical-rate", from: "critical", to: "rate", kind: "data", label: "trả kết quả" },
      { id: "wide-critical", from: "wide", to: "critical", kind: "control", label: "phình vùng găng" }
    ],
    learn: [
      "<strong>Mutex</strong> chỉ cho một luồng vào vùng găng, các luồng khác xếp hàng chờ.",
      "Khóa quá rộng, như bọc cả hàm 80 ms, làm tám luồng chạy như một.",
      "Thu hẹp vùng găng còn vài dòng, thông lượng tăng từ 1.200 lên 7.800 ảnh mỗi giờ.",
      "Giữ nhiều khóa thì <strong>thứ tự</strong> phải cố định, nếu không sẽ deadlock."
    ],
    steps: [
      {
        short: "Vùng găng",
        type: "concept",
        title: "Mutex bảo vệ một đoạn, không bảo vệ cả hàm",
        body: "Vùng găng là đoạn mã chỉ được một luồng chạy tại một thời điểm, thường vì nó cập nhật cấu trúc dùng chung như danh sách đơn hàng. Mutex là công cụ đơn giản nhất: luồng gọi <code>lock</code>, vào trong, làm việc, rồi <code>unlock</code>. Nếu luồng thứ hai gọi lock khi khóa đang bị giữ, nó bị chặn và xếp vào hàng đợi của hệ điều hành, không quay vòng chờ. Cái hay là tính đúng đắn gần như miễn phí về mặt suy nghĩ: chỉ cần xác định đúng đoạn mã nào cần bảo vệ. Cái dở là chi phí: mỗi lần khóa tốn vài chục nano giây, và mọi luồng khác phải đợi.",
        focus: ["pool", "mutex", "critical"],
        edges: ["pool-mutex", "mutex-critical"],
        metrics: { lockPct: "100", waitMs: "5", throughput: "1.200", ok: "Có" },
        changes: [
          "Xác định vùng găng là đoạn cập nhật danh sách dùng chung.",
          "Luồng thứ hai bị chặn ở lock thay vì chạy tiếp."
        ],
        note: "Mutex bảo đảm đúng, không bảo đảm nhanh."
      },
      {
        short: "Tám thành một",
        type: "flow",
        title: "Thêm luồng mà không nhanh hơn",
        body: "Đo trên máy 8 lõi với tác vụ xử lý ảnh 80 ms mỗi ảnh. Nếu khóa bọc cả hàm, luồng thứ nhất giữ khóa suốt 80 ms, bảy luồng còn lại đứng chờ. Thông lượng giữ nguyên 1.200 ảnh mỗi giờ, đúng bằng khi chạy một luồng, còn thời gian chờ cộng dồn lên 120 ms cho mỗi ảnh. Đây là nghịch lý thường gặp: thêm luồng, thêm tài nguyên, nhưng không nhanh hơn chút nào, thậm chí chậm hơn vì chi phí chuyển ngữ cảnh. Dấu hiệu nhận biết rất rõ: CPU chỉ chạm 13 phần trăm, còn các luồng thì nằm trong trạng thái chờ khóa.",
        focus: ["pool", "queue", "wait", "rate"],
        edges: ["pool-queue", "queue-wait", "critical-rate"],
        metrics: { lockPct: "100", waitMs: "120", throughput: "1.200", ok: "Không" },
        changes: [
          "Bảy trong tám luồng thường trực ở trạng thái chờ khóa.",
          "Thời gian chờ cộng dồn 120 ms cho mỗi ảnh."
        ],
        note: "CPU thấp mà thông lượng không tăng là dấu hiệu khóa quá rộng."
      },
      {
        short: "Khóa quá rộng",
        type: "detail",
        title: "Chỉ năm mili giây cần độc quyền",
        body: "Nguyên nhân nằm ở độ rộng của vùng găng. Hàm xử lý ảnh gồm ba phần: giải mã tệp 70 ms, cập nhật bộ đếm và danh sách 5 ms, ghi tệp kết quả 5 ms. Chỉ phần giữa cần độc quyền, nhưng nhiều mã lại đặt khóa ở đầu hàm và nhả ở cuối, biến toàn bộ 80 ms thành vùng găng. Khi đó tám luồng gần như chạy tuần tự, và lợi ích song song biến mất. Cách sửa không phải bỏ khóa, mà là kéo khóa vào sát dữ liệu: tính toán nặng ra ngoài, chỉ giữ khóa quanh vài dòng cập nhật. Quy tắc: vùng găng chỉ nên chứa thao tác trên dữ liệu chia sẻ, không chứa tính toán, không chứa vào ra tệp.",
        focus: ["mutex", "critical", "wide"],
        edges: ["wide-critical", "mutex-critical"],
        metrics: { lockPct: "100", waitMs: "120", throughput: "1.200", ok: "Không" },
        changes: [
          "Phát hiện chỉ 5 trong 80 ms thực sự cần độc quyền.",
          "Xác định khóa được đặt ở đầu hàm thay vì quanh dữ liệu."
        ],
        note: "Đo từng phần của hàm trước khi quyết định chỗ đặt khóa."
      },
      {
        short: "Thu hẹp",
        type: "flow",
        title: "Kéo khóa vào sát dữ liệu",
        body: "Áp dụng quy tắc trên: giải mã và ghi tệp chạy ngoài khóa, chỉ 5 ms cập nhật danh sách nằm trong. Tỉ lệ thời gian phải khóa giảm từ 100 phần trăm xuống khoảng 6 phần trăm, thời gian chờ mỗi ảnh còn 6 ms, thông lượng lên 7.800 ảnh mỗi giờ, gần gấp sáu lần. CPU tám lõi lúc này mới thực sự được dùng. Một biến thể tốt hơn nữa là chia danh sách thành tám mảnh theo chỉ số luồng, mỗi mảnh một khóa riêng, để tám luồng không tranh nhau một khóa. Nhưng đừng vội: hãy đo lại sau mỗi lần đổi, vì vùng găng nhỏ vẫn có thể nghẽn nếu tần suất gọi quá cao.",
        focus: ["mutex", "critical", "rate", "wait"],
        edges: ["mutex-critical", "critical-rate", "queue-wait"],
        metrics: { lockPct: "6", waitMs: "6", throughput: "7.800", ok: "Có" },
        changes: [
          "Giải mã và ghi tệp chuyển ra ngoài vùng găng.",
          "Thông lượng tăng từ 1.200 lên 7.800 ảnh mỗi giờ."
        ],
        note: "Đo lại sau mỗi lần thu hẹp; vùng găng nhỏ vẫn có thể nghẽn."
      },
      {
        short: "Thứ tự khóa",
        type: "final",
        title: "Hai khóa phải có thứ tự cố định",
        body: "Khi cần giữ hai khóa cùng lúc, thứ tự là yếu tố sống còn. Luồng A giữ khóa tài khoản rồi xin khóa đơn hàng, luồng B giữ khóa đơn hàng rồi xin khóa tài khoản: cả hai chờ nhau mãi mãi, đó là deadlock. Cách phòng là đặt thứ tự toàn cục, ví dụ luôn khóa tài khoản trước đơn hàng, hoặc gán số cho từng khóa và khóa theo thứ tự tăng dần. Ngoài ra hãy đặt thời gian chờ có giới hạn để phát hiện sớm, và dùng <code>try_lock</code> khi có thể nhả ra thử lại. Checklist: một vùng găng thật hẹp, một thứ tự khóa cố định, một phép đo thông lượng sau mỗi thay đổi.",
        focus: "all",
        edges: "all",
        metrics: { lockPct: "6", waitMs: "6", throughput: "7.800", ok: "Có" },
        changes: [
          "Đặt thứ tự khóa cố định: tài khoản trước, đơn hàng sau.",
          "Thêm thời gian chờ có giới hạn cho mọi lần xin khóa."
        ],
        note: "Deadlock không tự khỏi; chỉ thứ tự cố định mới phòng được.",
        tone: "final"
      }
    ]
  };

  T.lessons["atomic"] = {
    id: "atomic",
    module: "nen-tang-song-song",
    title: "Thao tác nguyên tử",
    shortTitle: "Thao tác nguyên tử",
    subtitle: "Compare-and-swap thay cho khóa",
    blurb: "Biến nguyên tử gộp đọc, tính, ghi thành một thao tác không chia cắt, nên bộ đếm đúng mà không cần khóa. Bài này đi từ compare-and-swap đến fetch_add, rồi chỉ ra giới hạn thật: tranh chấp cache line.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["nguyên tử", "compare-and-swap", "fetch_add", "lock-free", "cache line"],
    metrics: [
      { key: "ops", label: "Số thao tác", tone: "blue" },
      { key: "atomicPct", label: "Tỉ lệ nguyên tử", tone: "mint" },
      { key: "conflicts", label: "Lần thử lại", tone: "coral" },
      { key: "ok", label: "Kết quả đúng", tone: "yellow" }
    ],
    nodes: [
      { id: "worker", type: "task", x: 55, y: 80, w: 200, h: 70, label: "Luồng tăng", sub: "gọi fetch_add một" },
      { id: "atom", type: "memory", x: 340, y: 80, w: 200, h: 70, label: "Biến nguyên tử", sub: "atomic long dem" },
      { id: "cas", type: "code", x: 625, y: 80, w: 200, h: 70, label: "Lệnh CAS", sub: "so sánh rồi đổi" },
      { id: "retry", type: "event", x: 55, y: 310, w: 200, h: 70, label: "Vòng thử lại", sub: "thất bại thì lặp" },
      { id: "result", type: "check", x: 340, y: 310, w: 200, h: 70, label: "Kết quả 10.000", sub: "không mất lần nào" },
      { id: "free", type: "bolt", x: 625, y: 310, w: 200, h: 70, label: "Không cần khóa", sub: "luồng không chờ nhau" },
      { id: "contend", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "Tranh chấp cache", sub: "cache line đổi liên tục" }
    ],
    edges: [
      { id: "worker-cas", from: "worker", to: "cas", kind: "request", label: "gọi fetch_add" },
      { id: "cas-atom", from: "cas", to: "atom", kind: "data", label: "đọc giá trị cũ" },
      { id: "cas-retry", from: "cas", to: "retry", kind: "control", label: "CAS thất bại", bow: 22 },
      { id: "retry-cas", from: "retry", to: "cas", kind: "response", label: "thử lại", bow: -22 },
      { id: "atom-result", from: "atom", to: "result", kind: "data", label: "giá trị đúng" },
      { id: "worker-free", from: "worker", to: "free", kind: "control", label: "không cấp khóa" },
      { id: "contend-atom", from: "contend", to: "atom", kind: "data", label: "đẩy qua cache" }
    ],
    learn: [
      "<strong>CAS</strong> so sánh giá trị hiện tại với giá trị mong đợi rồi mới ghi giá trị mới.",
      "Biến <code>atomic</code> biến đọc, cộng, ghi thành một thao tác không chia cắt.",
      "Với một phép cộng, <strong>nguyên tử</strong> nhanh hơn mutex vì không chặn luồng nào.",
      "Tranh chấp cache line là giới hạn thật khi nhiều lõi cùng tăng một biến."
    ],
    steps: [
      {
        short: "CAS là gì",
        type: "concept",
        title: "Ba bước gộp thành một lệnh",
        body: "Phép cộng thông thường gồm ba bước máy, nên hai luồng chen vào giữa là mất một lần cộng. Phần cứng cung cấp lệnh so sánh và đổi trong một bước không chia cắt, gọi là <strong>compare-and-swap</strong>: nếu ô nhớ vẫn đang giữ giá trị tôi đọc, hãy ghi giá trị mới; nếu không, báo thất bại và không đổi gì. Từ lệnh này, thư viện dựng nên biến nguyên tử với các phép cộng, trừ, trao đổi. Với <code>atomic&lt;long&gt;</code>, phép <code>fetch_add</code> cộng thêm một và trả về giá trị cũ, tất cả trong một thao tác. Không có khe nào cho luồng khác chen vào, nên kết quả luôn đủ 10.000.",
        focus: ["worker", "cas", "atom"],
        edges: ["worker-cas", "cas-atom"],
        metrics: { ops: "10.000", atomicPct: "0", conflicts: "312", ok: "Không" },
        changes: [
          "Xác định lệnh CAS là nền của mọi thao tác nguyên tử.",
          "Khe giữa đọc và ghi bị đóng lại ở mức phần cứng."
        ],
        note: "CAS không khóa gì cả, nó chỉ kiểm tra rồi mới đổi."
      },
      {
        short: "Vòng lặp CAS",
        type: "flow",
        title: "Thất bại thì đọc lại và thử tiếp",
        body: "Nếu chỉ có CAS, ta tự viết vòng lặp. Đọc giá trị cũ, tính giá trị mới, gọi compare-and-swap với kỳ vọng là giá trị cũ. Nếu thành công thì xong; nếu thất bại, nghĩa là luồng khác vừa đổi biến, ta đọc lại và thử tiếp. Vòng lặp này gọi là lock-free vì một luồng bị cắt vẫn không chặn các luồng khác tiến lên. Với 10.000 lần cộng từ hai luồng, số lần thất bại chỉ khoảng vài trăm, mỗi lần tốn vài chục nano giây, tổng chi phí không đáng kể. Điều kiện quan trọng: thân vòng lặp phải là hàm thuần, không có tác dụng phụ, nếu không mỗi lần thử lại sẽ ghi log hai lần.",
        focus: ["cas", "retry", "worker"],
        edges: ["cas-retry", "retry-cas", "worker-cas"],
        metrics: { ops: "10.000", atomicPct: "100", conflicts: "312", ok: "Có" },
        changes: [
          "Vòng lặp đọc, tính, CAS thay cho đoạn đọc rồi ghi.",
          "Mỗi lần CAS thất bại được đếm và thử lại ngay."
        ],
        note: "Thân vòng lặp phải thuần, nếu không sẽ nhân đôi tác dụng phụ."
      },
      {
        short: "fetch_add",
        type: "detail",
        title: "Thư viện đã cài sẵn vòng lặp",
        body: "Thư viện chuẩn đã cài sẵn vòng lặp đó trong <code>fetch_add</code>, và trên nhiều kiến trúc nó ánh xạ thành một lệnh duy nhất như <code>lock xadd</code> của x86, không cần thử lại. Với bộ đếm đơn hàng, đây là lựa chọn rẻ nhất: không cấp khóa, không chặn luồng, không cần giữ trạng thái. Nhưng nguyên tử chỉ đúng cho một biến. Nếu bạn cần cập nhật hai biến cùng lúc, ví dụ tăng số đơn và cộng doanh thu, hai phép nguyên tử riêng lẻ vẫn có thể bị chen giữa, nên phải gộp vào một cấu trúc hoặc dùng khóa. Ngoài ra hãy chọn thứ tự bộ nhớ vừa đủ, mặc định tuần tự là an toàn nhưng chậm hơn.",
        focus: ["atom", "cas", "result"],
        edges: ["cas-atom", "atom-result"],
        metrics: { ops: "10.000", atomicPct: "100", conflicts: "0", ok: "Có" },
        changes: [
          "Số lần thử lại về 0 nhờ lệnh cộng nguyên tử duy nhất.",
          "Bộ đếm đạt đúng 10.000 mà không cần giữ khóa."
        ],
        note: "Nguyên tử đúng cho một biến; hai biến cần gộp hoặc khóa."
      },
      {
        short: "Cache line",
        type: "pitfall",
        title: "Đúng nhưng vẫn có thể chậm",
        body: "Nguyên tử không miễn phí khi mọi luồng đập vào cùng một ô nhớ. Mỗi lần một lõi ghi, cache line 64 byte trên các lõi khác bị đánh dấu hỏng và phải nạp lại, gọi là ping-pong cache. Với tám luồng tăng một bộ đếm, thông lượng có thể giảm còn một phần ba so với tám bộ đếm riêng. Cách xử lý: mỗi luồng cộng vào bộ đếm cục bộ, cuối cùng mới gộp, hoặc đệm thêm để mỗi bộ đếm nằm trên một cache line riêng. Và đừng lạm dụng nguyên tử cho chuỗi thao tác dài: CAS lồng nhiều tầng khó đọc và dễ sai. Với cấu trúc phức tạp, mutex vẫn trong sáng hơn.",
        focus: ["contend", "atom", "free"],
        edges: ["contend-atom", "worker-free"],
        metrics: { ops: "1.000.000", atomicPct: "100", conflicts: "0", ok: "Có" },
        changes: [
          "Nhận ra nút thắt chuyển từ khóa sang cache line dùng chung.",
          "Chuyển sang bộ đếm cục bộ mỗi luồng rồi gộp cuối."
        ],
        note: "Đúng số liệu chưa đủ; hãy đo thông lượng khi mọi lõi cùng ghi."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Khi nào dùng nguyên tử",
        body: "Tổng kết bằng bốn câu hỏi. Một: có đúng một biến cần cập nhật không, nếu hai biến thì nghĩ tới khóa. Hai: phép cập nhật có gọn trong một biểu thức không, nếu cần đọc rồi quyết định nhiều bước thì cân nhắc lại. Ba: tần suất ghi có cao và cùng một ô nhớ không, nếu có thì chia bộ đếm để giảm tranh chấp cache. Bốn: đã đo thông lượng chưa. Với bộ đếm đơn hàng, <code>fetch_add</code> là đủ và nhanh hơn mutex khoảng ba lần trong bài đo này. Với danh sách đơn hàng nhiều trường, mutex vẫn dễ đúng hơn một vòng CAS tự viết.",
        focus: "all",
        edges: "all",
        metrics: { ops: "1.000.000", atomicPct: "100", conflicts: "0", ok: "Có" },
        changes: [
          "Chốt dùng fetch_add cho bộ đếm, mutex cho danh sách.",
          "Thêm phép đo thông lượng vào bài kiểm tra hiệu năng."
        ],
        note: "Chọn công cụ theo số biến cần cập nhật, không theo mốt.",
        tone: "final"
      }
    ]
  };

  T.practice.push({
    id: "dem-don-hang",
    module: "nen-tang-song-song",
    tag: "RACE",
    tags: ["RACE", "đếm", "đồng bộ"],
    title: "Bộ đếm đơn hàng thiếu 400 lần",
    scenario: "Một sàn bán hàng nhỏ xử lý 10.000 đơn trong đợt khuyến mãi. Hàm ghi nhận đơn chạy trên hai luồng, mỗi luồng lặp 5.000 lần và thực hiện đúng một dòng: đọc biến đếm toàn cục, cộng một, ghi lại. Khi đối soát, bảng điều khiển hiển thị 9.600 đơn đã xử lý trong khi nhật ký thanh toán có đủ 10.000 giao dịch, thiếu 400. Chạy lại trên máy chủ khác, con số thiếu đổi thành 327 rồi 288. Không có ngoại lệ nào được ném ra, không có dòng lỗi trong log. Nhóm vận hành cần con số đếm chính xác để đối soát doanh thu, và không muốn giảm số luồng.",
    metrics: [
      { label: "Số luồng", value: "2" },
      { label: "Lần cộng", value: "10.000" },
      { label: "Thiếu", value: "400", danger: true }
    ],
    options: [
      "Giữ nguyên mã, thêm bước kiểm tra lại tổng sau khi chạy xong",
      "Bọc ba bước đọc, cộng, ghi trong một mutex hoặc dùng biến nguyên tử",
      "Đổi biến đếm sang kiểu số thực để tránh tràn số khi cộng dồn",
      "Chèn sleep ngẫu nhiên vài mili giây giữa đọc và ghi để giảm va chạm"
    ],
    correct: 1,
    explain: "Phép đọc rồi cộng rồi ghi không nguyên tử: hai luồng có thể cùng đọc 41, cùng ghi 42, và một lần cộng biến mất. Bọc <code>mutex</code> hoặc dùng <code>fetch_add</code> gộp ba bước thành một thao tác không chia cắt, nên đủ 10.000. Kiểm tra lại tổng chỉ phát hiện sai chứ không sửa được nguyên nhân, và không biết đơn nào bị mất. Đổi sang số thực không giúp gì vì vấn đề là xen kẽ, không phải kiểu dữ liệu; số thực còn mất chính xác khi giá trị lớn. Sleep chỉ làm va chạm hiếm hơn chứ không loại bỏ, đồng thời làm chậm cả hệ thống."
  });

  T.practice.push({
    id: "khoa-ca-ham",
    module: "nen-tang-song-song",
    tag: "LOCK",
    tags: ["LOCK", "vùng găng", "thông lượng"],
    title: "Tám luồng chạy như một",
    scenario: "Dịch vụ xử lý ảnh chạy tám luồng trên máy tám lõi. Mỗi ảnh mất 60 ms, trong đó 48 ms là giải mã và nén, 4 ms cập nhật danh sách ảnh đã xong, 8 ms ghi tệp. Nhóm phát triển đặt mutex ở đầu hàm và nhả ở cuối để bảo vệ danh sách dùng chung. Đo được thông lượng chỉ 480 ảnh mỗi giờ, gần bằng khi chạy một luồng, còn CPU dừng ở 12 phần trăm. Khách hàng phàn nàn ảnh lên chậm vào giờ cao điểm. Cần tăng thông lượng gấp nhiều lần mà vẫn giữ danh sách nhất quán, không được đổi sang kiến trúc nhiều tiến trình.",
    metrics: [
      { label: "Số luồng", value: "8" },
      { label: "Thời gian khóa", value: "60/60 ms", danger: true },
      { label: "CPU dùng", value: "12%" }
    ],
    options: [
      "Tăng số luồng lên 32 để bù cho thời gian chờ khóa",
      "Đổi mutex sang khóa đọc ghi và giữ nguyên phạm vi khóa",
      "Giữ khóa chỉ quanh 4 ms cập nhật danh sách, đưa giải mã và ghi tệp ra ngoài",
      "Bỏ mutex và dựa vào việc danh sách hiếm khi bị sửa cùng lúc"
    ],
    correct: 2,
    explain: "Vùng găng đang bọc cả 60 ms, nên tám luồng xếp hàng và chạy tuần tự; thêm luồng chỉ làm hàng đợi dài hơn. Chỉ 4 ms cập nhật danh sách cần độc quyền, phần giải mã và ghi tệp vốn độc lập nên đưa ra ngoài. Khi đó thời gian khóa còn khoảng 7 phần trăm, thông lượng tăng gần tám lần. Khóa đọc ghi không cứu được vì mọi ảnh đều ghi vào danh sách. Bỏ mutex sẽ làm hỏng danh sách, vì hai luồng chèn cùng lúc có thể mất một mục hoặc tạo vòng lặp. Tăng luồng chỉ đổi hàng đợi, không đổi phần việc tuần tự."
  });

  T.cheatsheets.push({
    id: "parallel-basics",
    num: "01",
    module: "nen-tang-song-song",
    title: "Bảng tra nền tảng song song",
    intro: "Những thứ nên dán cạnh màn hình khi viết mã song song: bảng so sánh luồng với tiến trình, sơ đồ một lần xen kẽ làm mất phép cộng, mẫu mutex đúng, bảng thao tác nguyên tử và checklist thứ tự khóa.",
    cards: [
      {
        title: "Luồng và tiến trình",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Tiêu chí</th><th>Luồng</th><th>Tiến trình</th></tr></thead><tbody><tr><td>Bộ nhớ</td><td>Chung heap, riêng stack</td><td>Không gian địa chỉ riêng</td></tr><tr><td>Chi phí tạo</td><td class=\"mono\">~0,05 ms</td><td class=\"mono\">vài ms</td></tr><tr><td>Giao tiếp</td><td>Biến dùng chung, hàng đợi</td><td>Ống, socket, bộ nhớ chia sẻ</td></tr><tr><td>Rủi ro</td><td>Tranh chấp dữ liệu</td><td>Sao chép, khởi động chậm</td></tr><tr><td>Lỗi một đơn vị</td><td>Có thể kéo cả tiến trình</td><td>Cô lập, tiến trình khác sống</td></tr></tbody></table>"
      },
      {
        title: "Một lần xen kẽ làm mất phép cộng",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>A: nap dem = 41\nB: nap dem = 41\nA: ghi dem = 42\nB: ghi dem = 42\n// hai lan cong, mot ket qua\n// 10.000 lan chay -> thieu ~300</code></pre></div><p>Phép <code>dem += 1</code> là ba bước, không phải một.</p>"
      },
      {
        title: "Mẫu mutex đúng",
        wide: true,
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>prepare();          // ngoai vung gang\n{\n  lock_guard&lt;mutex&gt; g(m);\n  danh_sach.push(don);   // 4 ms\n}\nflush();            // ngoai vung gang\n\n// Quy tac: khong I/O, khong tinh toan\n// nang trong vung gang</code></pre></div><p>Khóa càng hẹp, các luồng càng ít phải xếp hàng; nhớ nhả khóa cả khi có ngoại lệ.</p>"
      },
      {
        title: "Thao tác nguyên tử",
        html: "<table class=\"cheat-table\"><thead><tr><th>Thao tác</th><th>Ý nghĩa</th><th>Dùng khi</th></tr></thead><tbody><tr><td class=\"mono\">load</td><td>Đọc nguyên tử</td><td>Đọc cờ trạng thái</td></tr><tr><td class=\"mono\">fetch_add</td><td>Cộng, trả giá trị cũ</td><td>Bộ đếm, thống kê</td></tr><tr><td class=\"mono\">exchange</td><td>Đổi, trả giá trị cũ</td><td>Chuyển trạng thái</td></tr><tr><td class=\"mono\">compare_exchange</td><td>So sánh rồi đổi</td><td>Vòng lặp lock-free</td></tr></tbody></table>"
      },
      {
        title: "Checklist thứ tự khóa",
        wide: true,
        html: "<ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\"><li>Đặt tên và số thứ tự cho từng khóa, luôn khóa theo thứ tự tăng dần.</li><li>Không xin khóa mới khi đang giữ khóa khác nếu không cần thiết.</li><li>Giữ khóa ngắn nhất có thể, không gọi mạng hay đọc tệp bên trong.</li><li>Dùng thời gian chờ có hạn hoặc <code>try_lock</code> để phát hiện deadlock sớm.</li><li>Nhả khóa theo thứ tự ngược với lúc lấy, tốt nhất dùng <code>lock_guard</code>.</li><li>Ghi lại đồ thị khóa trong tài liệu kiến trúc để người sau không phá vỡ.</li></ul>"
      }
    ]
  });
})();
