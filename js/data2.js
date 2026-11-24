/* ParallelLab — phần 2: mô hình lập trình (nhóm luồng, chia tác vụ, bất đồng bộ, GPU) */
window.PARALLELLAB = window.PARALLELLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };
(function () {
  const T = window.PARALLELLAB;

  T.modules.push({
    id: "mo-hinh-lap-trinh",
    num: "02",
    tone: "mint",
    title: "Mô hình lập trình",
    blurb: "Mỗi bài đi từ nhóm luồng đến GPU: tái sử dụng luồng thay vì tạo mới, chia dữ liệu thành khối cân bằng, giao việc bất đồng bộ bằng future, và chỉ đẩy lên GPU khi dữ liệu đủ lớn. Sơ đồ và số liệu đều áp dụng được ngay.",
    lessons: ["pool", "task", "async", "gpu"]
  });

  T.lessons["pool"] = {
    id: "pool",
    module: "mo-hinh-lap-trinh",
    title: "Nhóm luồng tái sử dụng",
    shortTitle: "Nhóm luồng",
    subtitle: "Hàng đợi việc và 16 luồng cố định",
    blurb: "Tạo luồng mới cho từng việc rất đắt: 2.000 ảnh mỗi phút nghĩa là 2.000 lần cấp phát ngăn xếp. Bài này dựng hàng đợi công việc, giữ cố định 16 luồng và đo tỉ lệ tái sử dụng để thấy chi phí biến mất.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["nhóm luồng", "hàng đợi", "tái sử dụng", "ngăn xếp", "quá tải"],
    metrics: [
      { key: "poolSize", label: "Số luồng", tone: "blue" },
      { key: "queue", label: "Hàng đợi", tone: "yellow" },
      { key: "reusePct", label: "Tái sử dụng", tone: "mint" },
      { key: "ok", label: "Trạng thái", tone: "coral" }
    ],
    nodes: [
      { id: "user", type: "server", x: 55, y: 80, w: 200, h: 70, label: "Máy chủ ảnh", sub: "2.000 yêu cầu mỗi phút" },
      { id: "queue", type: "queue", x: 340, y: 80, w: 200, h: 70, label: "Hàng đợi việc", sub: "2.000 việc đang chờ" },
      { id: "pool", type: "layers", x: 625, y: 80, w: 200, h: 70, label: "Nhóm 16 luồng", sub: "tạo một lần, dùng mãi" },
      { id: "worker", type: "code", x: 625, y: 310, w: 200, h: 70, label: "Luồng lấy việc", sub: "lấy việc khi rảnh" },
      { id: "out", type: "disk", x: 340, y: 310, w: 200, h: 70, label: "Ảnh đã xử lý", sub: "ghi vào kho ảnh" },
      { id: "reuse", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "Đo tái sử dụng", sub: "99,2% việc tái dùng" },
      { id: "naive", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "Tạo luồng tùy ý", sub: "2.000 luồng, sập máy" }
    ],
    edges: [
      { id: "user-queue", from: "user", to: "queue", kind: "request", label: "đẩy ảnh" },
      { id: "queue-pool", from: "queue", to: "pool", kind: "control", label: "phát việc", bow: 22 },
      { id: "pool-queue", from: "pool", to: "queue", kind: "response", label: "luồng rảnh", bow: -22 },
      { id: "pool-worker", from: "pool", to: "worker", kind: "control", label: "cấp luồng" },
      { id: "worker-out", from: "worker", to: "out", kind: "data", label: "ảnh đã cắt" },
      { id: "out-reuse", from: "out", to: "reuse", kind: "data", label: "đo tỉ lệ" },
      { id: "naive-pool", from: "naive", to: "pool", kind: "control", label: "quá tải" }
    ],
    learn: [
      "Mỗi luồng tốn khoảng 1 MB ngăn xếp và 50 đến 100 micro giây để tạo.",
      "Nhóm luồng giữ 16 luồng sống, nhận việc từ một hàng đợi chung.",
      "Kích thước nhóm tính từ thời gian mỗi việc và mức cao điểm.",
      "Hàng đợi phải có trần, nếu không sẽ tràn RAM thay vì báo quá tải."
    ],
    steps: [
      {
        short: "Vì sao tốn kém",
        type: "concept",
        title: "Tạo luồng cho từng việc thì đắt",
        body: "Trên máy chủ ảnh, mỗi yêu cầu cần một ngăn xếp riêng, thường tốn 1 MB bộ nhớ ảo và 50 đến 100 micro giây để hệ điều hành tạo. Với <code>2.000 ảnh mỗi phút</code>, cách làm ngây thơ là tạo một luồng cho mỗi ảnh: 2.000 luồng cùng sống, tức khoảng 2 GB ngăn xếp, cộng thời gian chuyển ngữ cảnh giữa chúng. Bộ điều phối phải xếp hàng 2.000 tác vụ trên 8 lõi, nên phần lớn thời gian trôi vào việc đổi luồng chứ không phải cắt ảnh. Khi lượng yêu cầu tăng đột biến, máy hết bộ nhớ và tiến trình bị hệ điều hành giết. Chi phí tạo luồng không biến mất, nó chỉ chuyển từ CPU sang bộ nhớ.",
        focus: ["user", "naive", "pool"],
        edges: ["naive-pool", "pool-worker"],
        metrics: { poolSize: "2.000", queue: "2.000", reusePct: "0%", ok: "sập" },
        changes: [
          "Mỗi ảnh đến sinh thêm một luồng mới thay vì dùng luồng có sẵn.",
          "Bộ nhớ ảo tăng theo số yêu cầu và không bao giờ hạ xuống."
        ],
        note: "Ngăn xếp 1 MB nhân 2.000 luồng là 2 GB, phần lớn chỉ để chờ."
      },
      {
        short: "Hàng đợi và 16 luồng",
        type: "flow",
        title: "Hàng đợi việc, 16 luồng lấy dần",
        body: "Bộ điều phối giữ một hàng đợi công việc và 16 luồng cố định. Máy chủ ảnh chỉ đẩy một bản ghi nhỏ vào hàng đợi rồi trả về ngay, không chờ xử lý. Mỗi luồng lặp ba bước: lấy việc, cắt và nén ảnh trong khoảng 120 ms, rồi quay lại lấy việc kế tiếp. Với 2.000 ảnh mỗi phút, tổng thời gian CPU cần là 240 giây, chia cho 60 giây được 4 luồng; 16 luồng cho biên an toàn gấp bốn lần cho lúc cao điểm. Hàng đợi hấp thụ các đợt tăng vọt mà không cần tạo thêm luồng, còn thời gian chờ trung bình vẫn dưới 50 ms.",
        focus: ["user", "queue", "pool", "worker"],
        edges: ["user-queue", "queue-pool", "pool-worker"],
        metrics: { poolSize: "16", queue: "1.850", reusePct: "0%", ok: "ổn định" },
        changes: [
          "Máy chủ ảnh trả lời ngay sau khi đẩy việc vào hàng đợi.",
          "Số luồng sống cố định ở 16 thay vì tăng theo lưu lượng."
        ],
        note: "16 luồng không phải số đẹp, mà là 4 luồng cần thiết nhân bốn lần biên."
      },
      {
        short: "Tái sử dụng",
        type: "detail",
        title: "Tái sử dụng luồng và đo hiệu quả",
        body: "Tái sử dụng là điểm mấu chốt. Một luồng trong nhóm sống từ lúc khởi động đến khi tắt, nên chi phí tạo luồng chỉ trả 16 lần thay vì 2.000 lần mỗi phút. Sau khoảng một giờ, tỉ lệ tái sử dụng đạt <code>99,2%</code>: gần như mọi việc đều chạy trên luồng đã có. Cùng lợi ích đó, bộ nhớ ảo giữ nguyên 16 MB ngăn xếp thay vì 2 GB. Nhóm luồng còn giữ được bộ đệm và kết nối đã mở, ví dụ kết nối tới kho ảnh, nên mỗi việc bớt một lần bắt tay. Đổi lại, biến cục bộ của luồng có thể sót dữ liệu giữa hai việc, nên phải đặt lại trạng thái trước mỗi lần dùng.",
        focus: ["pool", "worker", "out", "reuse"],
        edges: ["pool-queue", "worker-out", "out-reuse"],
        metrics: { poolSize: "16", queue: "60", reusePct: "99,2%", ok: "ổn định" },
        changes: [
          "Chi phí tạo luồng giảm từ 2.000 lần mỗi phút xuống 16 lần mỗi lần khởi động.",
          "Hàng đợi rút từ 1.850 xuống 60 việc khi nhóm chạy đủ nhịp."
        ],
        note: "Tái sử dụng chỉ an toàn khi mỗi việc bắt đầu từ trạng thái sạch."
      },
      {
        short: "Ba lỗi",
        type: "pitfall",
        title: "Hàng đợi không trần và việc quá dài",
        body: "Ba lỗi thường gặp. Thứ nhất là hàng đợi không giới hạn: khi tải vượt 16 luồng, việc xếp hàng thay vì bị từ chối, hàng đợi phình tới 12.000 mục và RAM cạn trước khi có cảnh báo. Hãy đặt trần, ví dụ 2.000 mục, và trả lỗi 503 khi đầy. Thứ hai là đặt nhóm quá nhỏ, ví dụ 2 luồng cho tác vụ chờ mạng, khiến CPU rảnh trong khi việc vẫn ứ. Thứ ba là để một việc chạy quá lâu chiếm luồng, làm cả nhóm đói; hãy đặt hạn 5 giây và tách việc nặng sang nhóm riêng. Mỗi lỗi đều làm số liệu trông ổn trong lúc hệ thống đã mất kiểm soát.",
        focus: ["queue", "pool", "worker", "naive"],
        edges: ["queue-pool", "naive-pool"],
        metrics: { poolSize: "16", queue: "12.000", reusePct: "99,2%", ok: "tràn RAM" },
        changes: [
          "Hàng đợi tăng từ 60 lên 12.000 mục mà không có cảnh báo nào.",
          "Thời gian chờ trung bình vượt 30 giây dù nhóm vẫn đủ 16 luồng."
        ],
        note: "Hàng đợi không trần biến quá tải thành hết bộ nhớ, khó chẩn đoán hơn 503."
      },
      {
        short: "Cấu hình chốt",
        type: "final",
        title: "Chốt cấu hình nhóm luồng",
        tone: "final",
        body: "Chốt lại: giữ nhóm 16 luồng, một hàng đợi có trần 2.000 việc, mỗi việc có hạn 5 giây. Kích thước nhóm nên xuất phát từ phép đo: 2.000 ảnh mỗi phút nhân 120 ms chia 60 giây ra 4 luồng, rồi nhân bốn cho biên cao điểm. Không đặt nhóm lớn hơn số lõi cho tác vụ tính toán, và có thể lớn hơn cho tác vụ chờ mạng. Đặt tên luồng theo mục đích, ghi lại thời gian chờ trong hàng đợi, tỉ lệ tái sử dụng và số việc bị từ chối. Kiểm thử bằng cách bơm 4.000 yêu cầu trong một phút: hệ thống phải giữ phản hồi dưới 300 ms và không tăng bộ nhớ.",
        focus: "all",
        edges: "all",
        metrics: { poolSize: "16", queue: "200", reusePct: "99,2%", ok: "ổn định" },
        changes: [
          "Toàn bộ luồng nằm trong một nhóm có tên và số lượng cố định.",
          "Quá tải trả 503 ngay thay vì giữ việc trong bộ nhớ."
        ],
        note: "Nhóm luồng là hàng đợi cộng với số luồng, thiếu một trong hai là hỏng."
      }
    ]
  };

  T.lessons["task"] = {
    id: "task",
    module: "mo-hinh-lap-trinh",
    title: "Chia tác vụ và cân bằng tải",
    shortTitle: "Chia tác vụ",
    subtitle: "Chia khối, gộp kết quả, san tải",
    blurb: "Chia đều số khung hình không có nghĩa là chia đều thời gian. Bài này đi từ 8 khối tĩnh 125 khung, qua khối nặng gấp ba làm hỏng cả bài, đến 40 khối nhỏ và hàng đợi động giữ lệch tải dưới 6%.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["chia khối", "cân bằng tải", "hàng đợi động", "gộp kết quả", "lệch tải"],
    metrics: [
      { key: "tasks", label: "Tác vụ", tone: "blue" },
      { key: "chunks", label: "Số khối", tone: "mint" },
      { key: "imbalancePct", label: "Lệch tải", tone: "yellow" },
      { key: "ok", label: "Trạng thái", tone: "coral" }
    ],
    nodes: [
      { id: "source", type: "file", x: 55, y: 80, w: 200, h: 70, label: "Video 1.000 khung", sub: "mỗi khung 12 ms" },
      { id: "split", type: "grid", x: 340, y: 80, w: 200, h: 70, label: "Chia khối", sub: "8 khối × 125 khung" },
      { id: "pool", type: "layers", x: 625, y: 80, w: 200, h: 70, label: "Nhóm 8 luồng", sub: "mỗi luồng một khối" },
      { id: "work", type: "code", x: 625, y: 310, w: 200, h: 70, label: "Xử lý khung", sub: "lọc và mã hóa lại" },
      { id: "merge", type: "layers", x: 340, y: 310, w: 200, h: 70, label: "Gộp kết quả", sub: "nối theo chỉ số" },
      { id: "out", type: "disk", x: 55, y: 310, w: 200, h: 70, label: "Video đầu ra", sub: "1.000 khung đã ghép" },
      { id: "heavy", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "Khối nặng gấp ba", sub: "cảnh nhiều chuyển động" }
    ],
    edges: [
      { id: "source-split", from: "source", to: "split", kind: "data", label: "1.000 khung" },
      { id: "split-pool", from: "split", to: "pool", kind: "control", label: "8 khối" },
      { id: "split-heavy", from: "split", to: "heavy", kind: "control", label: "khối lệch" },
      { id: "heavy-work", from: "heavy", to: "work", kind: "data", label: "36 ms mỗi khung" },
      { id: "pool-work", from: "pool", to: "work", kind: "data", label: "khung hình" },
      { id: "work-merge", from: "work", to: "merge", kind: "data", label: "kết quả" },
      { id: "merge-out", from: "merge", to: "out", kind: "data", label: "ghép video" }
    ],
    learn: [
      "Chia tác vụ là chia dữ liệu độc lập, không chia mã nguồn.",
      "Chia đều số phần tử chưa chắc chia đều thời gian chạy.",
      "Thời gian của cả bài do khối chậm nhất quyết định.",
      "Khối nhỏ cộng hàng đợi động san được lệch tải mà chi phí vẫn thấp."
    ],
    steps: [
      {
        short: "Chia dữ liệu",
        type: "concept",
        title: "Chia dữ liệu, không chia mã",
        body: "Chia tác vụ là chia dữ liệu, không chia mã. Video có 1.000 khung hình, mỗi khung cần 12 ms để lọc và mã hóa lại, tổng cộng 12.000 ms công việc. Nếu một luồng làm hết, người dùng chờ 12 giây. Cách song song đơn giản nhất là cắt danh sách khung thành các đoạn rồi giao mỗi đoạn cho một luồng, vì các khung độc lập và thứ tự chỉ quan trọng lúc ghép. Mỗi luồng ghi kết quả vào đúng vị trí trong mảng đích, nên bước gộp chỉ là nối lại theo chỉ số. Đây là mẫu dữ liệu song song: cùng một hàm, nhiều phần dữ liệu khác nhau, không cần khóa nếu mỗi phần ghi vào ô riêng.",
        focus: ["source", "split", "merge"],
        edges: ["source-split", "work-merge"],
        metrics: { tasks: "1.000", chunks: "1", imbalancePct: "0%", ok: "chậm" },
        changes: [
          "Danh sách khung được cắt thành các đoạn rời nhau.",
          "Mỗi kết quả ghi vào ô riêng nên không cần khóa khi gộp."
        ],
        note: "Chỉ song song hóa được khi các phần dữ liệu thật sự độc lập."
      },
      {
        short: "Tám khối đều",
        type: "flow",
        title: "Tám khối, mỗi khối 125 khung",
        body: "Với 8 luồng, cách chia tĩnh dễ nghĩ nhất là 8 khối, mỗi khối 125 khung. Mỗi luồng nhận một khối, chạy 125 nhân 12 ms, tức 1.500 ms, rồi kết thúc. Tổng thời gian lý thuyết là 1.500 ms, tăng tốc gần 8 lần so với 12.000 ms. Cách chia này chỉ cần một phép chia, không cần hàng đợi, không cần khóa, nên chi phí phối hợp gần bằng không. Vấn đề nằm ở chỗ nó giả định mọi khung đều tốn 12 ms. Trong video thật, khung có cảnh chuyển động mạnh tốn gấp ba lần khung tĩnh, và không ai biết trước khối nào rơi vào cảnh nào.",
        focus: ["split", "pool", "work"],
        edges: ["split-pool", "pool-work"],
        metrics: { tasks: "1.000", chunks: "8", imbalancePct: "0%", ok: "đều khung" },
        changes: [
          "Mỗi luồng nhận đúng 125 khung, không cần xin việc thêm.",
          "Tổng thời gian lý thuyết giảm từ 12.000 ms xuống 1.500 ms."
        ],
        note: "Chia tĩnh chỉ đúng khi mọi phần dữ liệu có chi phí như nhau."
      },
      {
        short: "Khối nặng",
        type: "detail",
        title: "Một khối nặng chặn cả tám luồng",
        body: "Khối thứ ba chứa cảnh hành động nên mỗi khung tốn 36 ms, cả khối 4.500 ms. Bảy luồng còn lại xong sau 1.500 ms và ngồi chờ 3.000 ms. Tổng thời gian do luồng chậm nhất quyết định: 4.500 ms, tăng tốc chỉ còn <code>2,7 lần</code> trên 8 luồng, hiệu suất khoảng 33%. Số liệu lệch tải ở đây là 200%: khối nặng nhất gấp ba mức trung bình. Càng thêm luồng, vấn đề càng rõ, vì một khối nặng vẫn chặn toàn bộ. Cân bằng tải không phải chia đều số phần tử, mà chia đều thời gian dự kiến.",
        focus: ["heavy", "work", "pool", "merge"],
        edges: ["split-heavy", "heavy-work", "work-merge"],
        metrics: { tasks: "1.000", chunks: "8", imbalancePct: "200%", ok: "lệch tải" },
        changes: [
          "Khối thứ ba chạy 4.500 ms trong khi bảy khối khác xong ở 1.500 ms.",
          "Tăng tốc thực tế rơi từ gần 8 lần xuống 2,7 lần."
        ],
        note: "Thêm luồng không cứu được một khối không thể chia nhỏ."
      },
      {
        short: "Khối nhỏ và hàng đợi",
        type: "pitfall",
        title: "Chia nhỏ vừa phải, đừng chia vụn",
        body: "Cách sửa rẻ nhất là chia nhỏ hơn và để luồng tự lấy việc. Chia 1.000 khung thành 40 khối, mỗi khối 25 khung, đặt vào hàng đợi chung. Luồng nào xong sớm thì lấy khối kế, nên khối nặng chỉ làm chậm một lượt thay vì cả bài. Kết quả khoảng 1.700 ms, lệch tải còn 6%. Chia quá nhỏ thì ngược lại: 1.000 khối một khung khiến chi phí phối hợp và tranh chấp hàng đợi lớn hơn công việc thật. Quy tắc thực dụng là chọn khối sao cho mỗi khối chạy khoảng 10 đến 50 ms, và luôn đo trước khi chốt.",
        focus: ["split", "pool", "heavy", "work"],
        edges: ["split-pool", "split-heavy", "pool-work"],
        metrics: { tasks: "1.000", chunks: "40", imbalancePct: "6%", ok: "tốt hơn" },
        changes: [
          "Số khối tăng từ 8 lên 40, mỗi khối còn 25 khung.",
          "Thời gian chạy giảm từ 4.500 ms xuống khoảng 1.700 ms."
        ],
        note: "Mỗi khối nên chạy 10 đến 50 ms: đủ lớn để không bị chi phí phối hợp nuốt."
      },
      {
        short: "Chốt cách chia",
        type: "final",
        title: "Chốt cách chia và gộp",
        tone: "final",
        body: "Chốt lại: chia 1.000 khung thành 40 khối 25 khung, dùng hàng đợi động cho 8 luồng, gộp kết quả theo chỉ số khung. Đặt kích thước khối theo thời gian chứ không theo số phần tử, mục tiêu 10 đến 50 ms mỗi khối. Ghi lại thời gian từng khối để phát hiện cảnh nặng và tinh chỉnh lần sau. Giữ mảng kết quả đủ chỗ trước khi chạy để tránh khóa khi mở rộng. Kiểm thử bằng video có cảnh chuyển động mạnh và video tĩnh: chênh lệch thời gian giữa hai lần chạy phải dưới 10%. Nếu một khối luôn chậm hơn hẳn, hãy chia nhỏ chính khối đó.",
        focus: "all",
        edges: "all",
        metrics: { tasks: "1.000", chunks: "40", imbalancePct: "6%", ok: "đạt" },
        changes: [
          "Kích thước khối được chọn theo thời gian đo, không theo số khung.",
          "Bước gộp chỉ nối mảng theo chỉ số nên không cần khóa."
        ],
        note: "Lệch tải là chỉ số phải đo, không phải điều có thể suy ra từ số phần tử."
      }
    ]
  };

  T.lessons["async"] = {
    id: "async",
    module: "mo-hinh-lap-trinh",
    title: "Bất đồng bộ với future",
    shortTitle: "Bất đồng bộ",
    subtitle: "Chờ kết quả mà không chặn giao diện",
    blurb: "Mười hai lời gọi mạng, mỗi lời 400 ms, chờ lần lượt là 4.800 ms và giao diện đứng im. Bài này dựng future, gom bằng allSettled, đặt hạn 2.000 ms và xử lý lỗi để một dịch vụ hỏng không kéo cả trang.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["future", "promise", "allSettled", "timeout", "xử lý lỗi"],
    metrics: [
      { key: "requests", label: "Yêu cầu", tone: "blue" },
      { key: "pending", label: "Đang chờ", tone: "yellow" },
      { key: "timeoutMs", label: "Hạn chờ", tone: "coral" },
      { key: "ok", label: "Trạng thái", tone: "mint" }
    ],
    nodes: [
      { id: "ui", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Trang đặt hàng", sub: "12 yêu cầu song song" },
      { id: "future", type: "event", x: 340, y: 80, w: 200, h: 70, label: "Future", sub: "chưa có kết quả" },
      { id: "remote", type: "server", x: 625, y: 80, w: 200, h: 70, label: "Dịch vụ ngoài", sub: "12 lời gọi mạng" },
      { id: "done", type: "check", x: 55, y: 310, w: 200, h: 70, label: "Đơn đã xác nhận", sub: "hiển thị cho khách" },
      { id: "all", type: "layers", x: 340, y: 310, w: 200, h: 70, label: "Chờ tất cả", sub: "allSettled 2.000 ms" },
      { id: "error", type: "alert", x: 625, y: 310, w: 200, h: 70, label: "Nhánh lỗi", sub: "timeout, mã 500" },
      { id: "free", type: "clock", x: 340, y: 195, w: 200, h: 70, label: "Chờ không chặn", sub: "giao diện vẫn mượt" }
    ],
    edges: [
      { id: "ui-future", from: "ui", to: "future", kind: "request", label: "12 yêu cầu" },
      { id: "future-remote", from: "future", to: "remote", kind: "control", label: "gửi đi" },
      { id: "remote-error", from: "remote", to: "error", kind: "data", label: "lỗi 500", bow: 22 },
      { id: "error-remote", from: "error", to: "remote", kind: "request", label: "thử lại", bow: -22 },
      { id: "error-all", from: "error", to: "all", kind: "data", label: "một lời hỏng" },
      { id: "all-done", from: "all", to: "done", kind: "data", label: "11 kết quả tốt" },
      { id: "free-future", from: "free", to: "future", kind: "control", label: "giữ luồng rảnh" }
    ],
    learn: [
      "Gọi đồng bộ giữ luồng chính, nên giao diện đứng im khi chờ mạng.",
      "Future có ba trạng thái: đang chờ, hoàn tất và lỗi.",
      "Gom lời gọi bằng allSettled để một lỗi không xóa cả lô.",
      "Mỗi lời gọi cần hạn riêng và phải hủy khi hết hạn."
    ],
    steps: [
      {
        short: "Chờ đồng bộ",
        type: "concept",
        title: "Chờ đồng bộ làm đứng giao diện",
        body: "Gọi đồng bộ là gọi rồi đứng chờ. Trang đặt hàng cần 12 yêu cầu tới dịch vụ vận chuyển, mỗi yêu cầu mất 400 ms; nếu chờ lần lượt thì 4.800 ms và giao diện đứng im suốt thời gian đó. Bất đồng bộ đổi cách chờ: lời gọi trả về ngay một đối tượng đại diện cho kết quả tương lai, gọi là <code>Future</code> hay promise. Trạng thái của nó là đang chờ, hoàn tất hoặc lỗi. Luồng chính không bị giữ, nên vẫn vẽ giao diện và nhận thao tác khác. Khi kết quả về, phần xử lý đã đăng ký sẽ chạy. Chìa khóa là tách việc gửi khỏi việc nhận kết quả.",
        focus: ["ui", "future", "free"],
        edges: ["ui-future", "free-future"],
        metrics: { requests: "12", pending: "12", timeoutMs: "0", ok: "treo" },
        changes: [
          "Lời gọi mạng không còn giữ luồng vẽ giao diện.",
          "Trang đặt hàng nhận được một future ngay thay vì chờ phản hồi."
        ],
        note: "Bất đồng bộ không làm mạng nhanh hơn, nó chỉ trả lại luồng cho việc khác."
      },
      {
        short: "Vòng đời future",
        type: "flow",
        title: "Vòng đời của mười hai future",
        body: "Quy trình gồm bốn bước. Đầu tiên, mã tạo 12 future trong khoảng 40 ms, mỗi future gắn với một lời gọi tới dịch vụ ngoài. Thứ hai, một nhóm luồng nền thực hiện các lời gọi và đánh dấu từng future khi có phản hồi. Thứ ba, mã chính chờ tất cả bằng <code>allSettled</code> với hạn 2.000 ms. Thứ tư, kết quả được gán vào future và phần hiển thị cập nhật. Trong lúc chờ, giao diện vẫn nhận cuộn và bấm. Số future đang chờ là chỉ số đáng theo dõi: 12 lúc bắt đầu, giảm dần khi phản hồi về, và phải về 0 sau hạn. Nếu còn treo, đó là dấu hiệu rò rỉ.",
        focus: ["ui", "future", "remote", "all"],
        edges: ["ui-future", "future-remote", "error-all"],
        metrics: { requests: "12", pending: "5", timeoutMs: "2.000", ok: "mượt" },
        changes: [
          "Mười hai lời gọi chạy song song thay vì nối tiếp từng cái.",
          "Số future đang chờ giảm dần thay vì đứng nguyên ở 12."
        ],
        note: "Số future đang chờ là thước đo rò rỉ rẻ nhất trong hệ bất đồng bộ."
      },
      {
        short: "Hạn và gom lô",
        type: "detail",
        title: "Hạn chờ và gom bằng allSettled",
        body: "Chờ có hạn là phần dễ bỏ sót. Mỗi future cần một hạn, ví dụ 800 ms cho một lời gọi, và toàn bộ lô có hạn 2.000 ms. Khi hết hạn, future chuyển sang trạng thái lỗi thay vì treo mãi. <code>allSettled</code> khác <code>all</code> ở chỗ nó chờ mọi future kết thúc, kể cả lỗi, rồi trả về danh sách kết quả và lỗi riêng. Nhờ vậy một dịch vụ hỏng không làm mất 11 kết quả tốt. Với 12 lời gọi song song, tổng thời gian xấp xỉ lời gọi chậm nhất, khoảng 420 ms, thay vì 4.800 ms. Đây là lợi ích lớn nhất: chờ theo chiều sâu của một lời gọi, không phải tổng của cả lô.",
        focus: ["future", "all", "done", "free"],
        edges: ["all-done", "free-future"],
        metrics: { requests: "12", pending: "1", timeoutMs: "2.000", ok: "mượt" },
        changes: [
          "Thời gian chờ giảm từ 4.800 ms xuống khoảng 420 ms.",
          "Một lời gọi hỏng chỉ mất một kết quả, mười một kết quả khác vẫn dùng được."
        ],
        note: "allSettled phù hợp khi các lời gọi độc lập; all thì hỏng cả lô vì một lỗi."
      },
      {
        short: "Bốn lỗi",
        type: "pitfall",
        title: "Bốn lỗi bất đồng bộ thường gặp",
        body: "Bốn lỗi thường gặp. Thứ nhất là gọi mà không giữ future, nên lỗi xảy ra không ai bắt và ứng dụng vẫn báo thành công. Thứ hai là <code>await</code> trong vòng lặp, biến 12 lời gọi song song thành 4.800 ms tuần tự. Thứ ba là hết hạn nhưng không hủy lời gọi, khiến dịch vụ ngoài vẫn làm việc và tài nguyên vẫn bị giữ. Thứ tư là thử lại vô hạn khi dịch vụ sập, tạo vòng xoáy tải. Cách chặn: luôn gắn xử lý lỗi, gom lời gọi bằng <code>allSettled</code>, hủy khi hết hạn hoặc rời trang, và giới hạn thử lại ba lần với khoảng chờ tăng dần.",
        focus: ["remote", "error", "all"],
        edges: ["remote-error", "error-remote", "error-all"],
        metrics: { requests: "12", pending: "3", timeoutMs: "2.000", ok: "có lỗi" },
        changes: [
          "Lỗi từ dịch vụ ngoài được đưa vào danh sách kết quả thay vì nuốt mất.",
          "Mỗi lần hỏng được thử lại tối đa ba lần thay vì vô hạn."
        ],
        note: "Hết hạn mà không hủy thì dịch vụ vẫn làm, chỉ có người dùng là thôi chờ."
      },
      {
        short: "Chốt cấu hình",
        type: "final",
        title: "Chốt cấu hình bất đồng bộ",
        tone: "final",
        body: "Chốt lại: mỗi lời gọi có hạn 800 ms, cả lô có hạn 2.000 ms, gom bằng <code>allSettled</code> và hiển thị cả phần lỗi. Giữ future ở nơi có thể hủy khi người dùng rời trang. Ghi log mã lời gọi, thời gian và trạng thái để đối chiếu. Đặt giới hạn ba lần thử lại với khoảng chờ 200, 400, 800 ms. Đừng chờ tuần tự trong vòng lặp nếu các lời gọi độc lập. Kiểm thử bằng một dịch vụ giả chậm 3.000 ms: sau 2.000 ms giao diện phải báo lỗi rõ ràng, không treo, và 11 kết quả còn lại vẫn hiển thị.",
        focus: "all",
        edges: "all",
        metrics: { requests: "12", pending: "0", timeoutMs: "2.000", ok: "ổn định" },
        changes: [
          "Mọi lời gọi đều có hạn và có đường hủy khi rời trang.",
          "Phần lỗi được hiển thị riêng thay vì che mất kết quả tốt."
        ],
        note: "Hạn chờ và hủy là một cặp; thiếu hủy thì hạn chỉ che lỗi."
      }
    ]
  };

  T.lessons["gpu"] = {
    id: "gpu",
    module: "mo-hinh-lap-trinh",
    title: "Tính toán trên GPU",
    shortTitle: "Tính toán GPU",
    subtitle: "Hàng nghìn lõi và chi phí truyền dữ liệu",
    blurb: "GPU có hàng nghìn lõi nhỏ nhưng bộ nhớ riêng, nên mọi phép tính phải trả phí truyền qua PCIe. Bài này đo ma trận 4.096 vuông: 12 ms truyền, 4 ms tính, 380 ms nếu chỉ dùng CPU, và lúc nào GPU không đáng.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["GPU", "kernel", "PCIe", "cường độ tính toán", "lô dữ liệu"],
    metrics: [
      { key: "threads", label: "Số luồng", tone: "blue" },
      { key: "transferMs", label: "Truyền", tone: "yellow" },
      { key: "computeMs", label: "Tính toán", tone: "mint" },
      { key: "ok", label: "Kết luận", tone: "coral" }
    ],
    nodes: [
      { id: "host", type: "server", x: 55, y: 80, w: 200, h: 70, label: "Máy chủ", sub: "ma trận 4.096 vuông" },
      { id: "pcie", type: "signal", x: 340, y: 80, w: 200, h: 70, label: "PCIe 12 GB/s", sub: "67 MB mỗi chiều" },
      { id: "vram", type: "memory", x: 625, y: 80, w: 200, h: 70, label: "Bộ nhớ GPU", sub: "8 GB VRAM" },
      { id: "cores", type: "grid", x: 625, y: 310, w: 200, h: 70, label: "65.536 luồng", sub: "lô 32 luồng" },
      { id: "back", type: "disk", x: 340, y: 310, w: 200, h: 70, label: "Kết quả về RAM", sub: "67 MB, 6 ms" },
      { id: "total", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "Đo cả vòng", sub: "16 ms thay vì 380" },
      { id: "small", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "Lô nhỏ 1 MB", sub: "truyền át tính toán" }
    ],
    edges: [
      { id: "host-pcie", from: "host", to: "pcie", kind: "data", label: "67 MB" },
      { id: "pcie-vram", from: "pcie", to: "vram", kind: "data", label: "nạp lên GPU" },
      { id: "vram-cores", from: "vram", to: "cores", kind: "control", label: "cấp phát" },
      { id: "cores-back", from: "cores", to: "back", kind: "data", label: "67 MB kết quả" },
      { id: "back-total", from: "back", to: "total", kind: "data", label: "đo tổng" },
      { id: "total-host", from: "total", to: "host", kind: "response", label: "báo cáo" },
      { id: "small-pcie", from: "small", to: "pcie", kind: "control", label: "1 MB mỗi lần" }
    ],
    learn: [
      "GPU đổi số lõi lấy độ phức tạp: hàng nghìn lõi nhỏ, chạy cùng lệnh.",
      "Dữ liệu phải qua PCIe hai chiều, chi phí này không được bỏ qua.",
      "Chỉ đáng dùng GPU khi phép tính lặp nhiều lần trên mỗi byte.",
      "Gộp lô lớn và giữ dữ liệu trên GPU để giảm số lần truyền."
    ],
    steps: [
      {
        short: "Nhiều lõi nhỏ",
        type: "concept",
        title: "GPU là nhiều lõi nhỏ, không phải CPU nhanh",
        body: "GPU không phải CPU nhanh hơn mà là nhiều lõi nhỏ hơn. Một card tầm trung có khoảng 65.536 luồng chạy đồng thời theo lô 32 luồng, mỗi lõi chỉ giỏi số học đơn giản trên dữ liệu song song. Ma trận 4.096 nhân 4.096 có 16,7 triệu phần tử, mỗi phần tử một phép nhân cộng, nên chia cho 65.536 luồng là vừa khít. CPU 8 lõi làm tuần tự mất khoảng 380 ms; GPU làm phần tính toán chỉ 4 ms. Nhưng GPU có bộ nhớ riêng, nên dữ liệu phải đi qua PCIe trước và kết quả phải quay về. Thời gian thật là tổng của truyền và tính, không phải con số 4 ms.",
        focus: ["host", "cores", "vram"],
        edges: ["vram-cores", "host-pcie"],
        metrics: { threads: "8", transferMs: "0", computeMs: "380", ok: "chỉ CPU" },
        changes: [
          "Phép tính được nhìn theo số phần tử song song, không theo số lõi.",
          "Ma trận 16,7 triệu phần tử vừa với 65.536 luồng chia theo lô."
        ],
        note: "65.536 luồng không nhanh hơn 8 lõi ở mọi việc, chỉ nhanh ở việc song song dày."
      },
      {
        short: "Vòng truyền và tính",
        type: "flow",
        title: "Bốn chặng: lên, tính, về, đo",
        body: "Luồng dữ liệu gồm bốn chặng. Chặng một, CPU đóng gói 67 MB ma trận và gửi qua PCIe 12 GB/s, mất khoảng 6 ms. Chặng hai, GPU cấp phát vùng nhớ và nhận dữ liệu, thêm 6 ms nữa nếu tính cả chiều về sau này. Chặng ba, kernel chạy 65.536 luồng trong 4 ms. Chặng bốn, kết quả 67 MB quay về RAM, mất 6 ms. Tổng khoảng 16 ms, tăng tốc 24 lần so với 380 ms của CPU. Con số đáng nhớ là <code>12 ms truyền</code> lớn gấp ba lần 4 ms tính toán. Với dữ liệu càng nhỏ, phần truyền càng lấn át và lợi ích càng giảm.",
        focus: ["host", "pcie", "vram", "cores", "back"],
        edges: ["host-pcie", "pcie-vram", "cores-back"],
        metrics: { threads: "65.536", transferMs: "12", computeMs: "4", ok: "nhanh 24x" },
        changes: [
          "Tổng thời gian vòng là 16 ms thay vì 4 ms tính toán thuần.",
          "Phần truyền chiếm ba phần tư thời gian của cả vòng."
        ],
        note: "Đo cả vòng, đừng chỉ đo kernel rồi tuyên bố nhanh gần trăm lần."
      },
      {
        short: "Khi nào đáng",
        type: "detail",
        title: "Cường độ tính toán quyết định",
        body: "Tiêu chí chọn GPU là cường độ tính toán, tức số phép tính trên mỗi byte dữ liệu. Ma trận lớn, lọc ảnh, huấn luyện mô hình đều có cường độ cao nên đáng đẩy lên GPU. Việc chỉ cộng hai mảng hoặc kiểm tra một trường lại có cường độ thấp: 67 MB dữ liệu mà chỉ một phép cộng mỗi phần tử thì 12 ms truyền đã nuốt hết lợi ích. Ba câu hỏi nên đặt: dữ liệu có đủ lớn để một lần truyền không oan không, phép tính có lặp nhiều lần trên cùng dữ liệu không, và có thể gộp nhiều lô nhỏ thành một lô lớn không. Nếu cả ba đều không, CPU là lựa chọn đúng.",
        focus: ["host", "cores", "total"],
        edges: ["back-total", "total-host"],
        metrics: { threads: "65.536", transferMs: "12", computeMs: "4", ok: "đáng dùng" },
        changes: [
          "Tiêu chí chuyển từ kích thước dữ liệu sang số phép tính mỗi byte.",
          "Quyết định có thêm bước ước lượng thời gian truyền trước khi chạy."
        ],
        note: "Cường độ dưới một phép tính mỗi byte thì truyền thường đắt hơn tính."
      },
      {
        short: "Ba lỗi",
        type: "pitfall",
        title: "Chia lô nhỏ và đồng bộ liên tục",
        body: "Ba lỗi khiến GPU chậm hơn CPU. Thứ nhất là gửi từng lô 1 MB: mỗi lần chỉ mất 0,4 ms truyền và 0,02 ms tính, nhưng chi phí khởi động kernel và đồng bộ khoảng 0,2 ms mỗi lần, cộng lại thành 100 lần gọi đắt hơn một lần gọi lớn. Thứ hai là đồng bộ sau mỗi bước, buộc CPU chờ GPU rồi lại chờ ngược, xóa mất khả năng chồng lấn. Thứ ba là quên chiều về: đo 4 ms tính rồi tuyên bố nhanh 95 lần trong khi thực tế chỉ 24 lần. Hãy đo toàn bộ vòng, giữ dữ liệu trên GPU giữa các bước, và gộp lô trước khi gửi.",
        focus: ["small", "pcie", "cores"],
        edges: ["small-pcie", "pcie-vram", "cores-back"],
        metrics: { threads: "65.536", transferMs: "0,4", computeMs: "0,02", ok: "không đáng" },
        changes: [
          "Một trăm lần gọi 1 MB bị gộp thành một lần gọi lớn.",
          "Số lần đồng bộ giữa CPU và GPU giảm từ mỗi bước xuống một lần."
        ],
        note: "Chi phí khởi động kernel chỉ đáng kể khi lô nhỏ, và khi đó nó thắng."
      },
      {
        short: "Chốt tiêu chí",
        type: "final",
        title: "Chốt tiêu chí dùng GPU",
        tone: "final",
        body: "Chốt lại: chỉ đẩy lên GPU khi dữ liệu đủ lớn và phép tính lặp nhiều lần. Gộp lô để mỗi lần truyền ít nhất vài chục MB, giữ dữ liệu trên GPU qua nhiều kernel, và đo cả ba phần: truyền lên, tính, truyền về. Với ma trận 4.096, tổng 16 ms so với 380 ms của CPU là đáng; với lô 1 MB thì không. Đặt ngưỡng trong mã, ví dụ dưới 8 MB thì chạy CPU, và ghi lại tỉ lệ thời gian truyền trên tổng. Kiểm thử bằng cách so kết quả GPU với CPU trên cùng dữ liệu, sai số phải trong mức cho phép.",
        focus: "all",
        edges: "all",
        metrics: { threads: "65.536", transferMs: "12", computeMs: "4", ok: "đạt" },
        changes: [
          "Mã có ngưỡng rõ ràng để chọn CPU hay GPU theo kích thước lô.",
          "Tỉ lệ thời gian truyền trên tổng được ghi lại sau mỗi lần chạy."
        ],
        note: "GPU là bài toán tổng chi phí, không phải bài toán số lõi."
      }
    ]
  };

  T.practice.push({
    id: "pool-2000-anh",
    tag: "POOL",
    module: "mo-hinh-lap-trinh",
    title: "Máy chủ ảnh sập vì tạo luồng",
    scenario: "Một dịch vụ chỉnh ảnh nhận 2.000 yêu cầu mỗi phút, mỗi ảnh cần cắt, nén và tạo ba kích thước, tốn trung bình 120 ms CPU. Bản đầu tạo một luồng mới cho mỗi ảnh. Buổi sáng lượng truy cập tăng gấp bốn, máy chủ 8 GB hết bộ nhớ do hàng nghìn ngăn xếp luồng, tiến trình bị hệ điều hành giết và dịch vụ sập trong 20 phút. Nhóm kỹ thuật đề xuất một nhóm 16 luồng với hàng đợi có trần, dùng lại luồng cho mọi ảnh. Sếp hỏi vì sao không giữ cách tạo luồng tùy ý, và liệu 16 luồng có đủ cho lúc cao điểm.",
    metrics: [
      { label: "Yêu cầu mỗi phút", value: "2.000" },
      { label: "Thời gian mỗi ảnh", value: "120 ms" },
      { label: "Ngăn xếp mỗi luồng", value: "1 MB" }
    ],
    options: [
      "Giữ cách tạo luồng cho mỗi ảnh nhưng nâng RAM máy chủ lên 32 GB",
      "Dùng nhóm 16 luồng, hàng đợi có trần 2.000 việc, trả 503 khi đầy",
      "Dùng nhóm 128 luồng để chắc chắn không việc nào phải chờ",
      "Bỏ song song, xử lý tuần tự từng ảnh để tránh hết bộ nhớ"
    ],
    correct: 1,
    explain: "Với 120 ms mỗi ảnh, 2.000 ảnh mỗi phút cần 240 giây CPU, tức 4 luồng; cao điểm gấp bốn cần 16 luồng, nên nhóm 16 là vừa. Hàng đợi có trần giữ RAM ổn định và biến quá tải thành lỗi 503 thay vì sập. Nâng RAM chỉ hoãn vấn đề: 2.000 luồng vẫn tốn chi phí chuyển ngữ cảnh và không kiểm soát được đỉnh. Nhóm 128 luồng vượt xa 8 lõi, gây tranh chấp và chuyển ngữ cảnh. Xử lý tuần tự bỏ hết lợi ích song song, không đáp ứng 2.000 ảnh mỗi phút. Nhóm cố định còn tái sử dụng bộ đệm nên mỗi ảnh nhanh hơn."
  });

  T.practice.push({
    id: "task-khung-hinh",
    tag: "TASK",
    module: "mo-hinh-lap-trinh",
    title: "Chia khung hình cho tám luồng",
    scenario: "Một xưởng dựng phim chia 1.000 khung hình của một cảnh cho 8 luồng, mỗi luồng một khối 125 khung, mỗi khung tốn 12 ms. Kết quả chạy mất 4.500 ms thay vì 1.500 ms như tính toán, vì khối thứ ba rơi đúng cảnh rượt đuổi, mỗi khung tốn 36 ms. Bảy luồng còn lại xong việc từ lâu và ngồi chờ, trong khi khách hàng phàn nàn bản dựng chậm. Quản lý muốn biết nên tăng số luồng lên 16, mua máy mạnh hơn, hay đổi cách chia việc. Ngân sách gần như cố định, thời hạn giao là ngày mai.",
    metrics: [
      { label: "Khung hình", value: "1.000" },
      { label: "Khối hiện tại", value: "8" },
      { label: "Khối nặng nhất", value: "4.500 ms" }
    ],
    options: [
      "Tăng lên 16 luồng nhưng vẫn giữ 8 khối ban đầu",
      "Chia 40 khối 25 khung và cho luồng lấy việc từ hàng đợi chung",
      "Chia đều 1.000 khung cho 8 luồng nhưng đảo thứ tự các khối",
      "Giao toàn bộ cảnh cho một luồng mạnh nhất để tránh chờ"
    ],
    correct: 1,
    explain: "Tăng lên 16 luồng không giúp vì khối nặng vẫn là một đơn vị không chia nhỏ; luồng nhận nó vẫn chạy 4.500 ms. Đảo thứ tự chỉ đổi luồng nào phải chờ. Giao một luồng thì mất hoàn toàn lợi ích song song. Chia 40 khối 25 khung rồi cho luồng lấy việc khi rảnh giúp khối nặng chỉ chiếm một lượt, thời gian còn khoảng 1.700 ms và lệch tải 6%. Khối 25 khung chạy khoảng 300 ms, vẫn đủ lớn để chi phí hàng đợi không đáng kể. Nếu muốn sát hơn, chia 80 khối nhưng phải đo lại chi phí phối hợp."
  });

  T.cheatsheets.push({
    id: "models",
    num: "02",
    module: "mo-hinh-lap-trinh",
    title: "Bảng tra mô hình lập trình",
    intro: "Bảng tra nhanh cho bốn mô hình: kích thước nhóm luồng, mẫu chia khối, vòng đời future và tiêu chí chọn GPU. Mỗi thẻ là thứ có thể chép vào tài liệu dự án hoặc dán vào phần ghi chú khi thiết kế.",
    cards: [
      {
        title: "Chọn kích thước nhóm luồng",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Loại việc</th><th>Công thức</th><th>Ví dụ</th><th>Tránh</th></tr></thead><tbody><tr><td>Nặng CPU</td><td class=\"mono\">số lõi + 1</td><td>Nén ảnh: 8 lõi, 9 luồng</td><td>32 luồng cho 8 lõi</td></tr><tr><td>Chờ mạng</td><td class=\"mono\">lõi × (1 + chờ/tính)</td><td>Chờ 800 ms, tính 40 ms: 8 × 21</td><td>Đặt bằng số lõi</td></tr><tr><td>Theo tải đo</td><td class=\"mono\">việc mỗi phút × ms ÷ 60.000</td><td>2.000 × 120 ÷ 60.000 = 4</td><td>Bỏ qua biên cao điểm</td></tr><tr><td>Hàng đợi</td><td>Trần theo RAM, ví dụ 2.000</td><td>Đầy thì trả 503</td><td>Hàng đợi vô hạn</td></tr></tbody></table>"
      },
      {
        title: "Mẫu chia khối và gộp",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>const CO = 25;              // 25 khung moi khoi\nconst chunks = [];\nfor (let i = 0; i &lt; frames.length; i += CO)\n  chunks.push([i, Math.min(i + CO, frames.length)]);\nconst out = new Array(frames.length);\nawait pool.run(chunks, ([a, b]) =&gt; {\n  for (let i = a; i &lt; b; i++) out[i] = work(frames[i]);\n});\n// gop theo chi so, khong can khoa</code></pre></div><p>Chọn khối 10 đến 50 ms; ghi thời gian từng khối để thấy cảnh nặng.</p>"
      },
      {
        title: "Vòng đời future và promise",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Trạng thái</th><th>Ý nghĩa</th><th>Cách xử lý</th></tr></thead><tbody><tr><td class=\"mono\">pending</td><td>Đã gửi, chưa có kết quả</td><td>Đếm số đang chờ, đặt hạn 800 ms</td></tr><tr><td class=\"mono\">fulfilled</td><td>Có giá trị, gán vào future</td><td>Ghi vào mảng kết quả theo chỉ số</td></tr><tr><td class=\"mono\">rejected</td><td>Lỗi mạng, timeout, mã 500</td><td>Bắt buộc, hiển thị riêng, thử lại 3 lần</td></tr><tr><td class=\"mono\">allSettled</td><td>Chờ mọi future kết thúc</td><td>Một lỗi không xóa cả lô</td></tr><tr><td class=\"mono\">all</td><td>Hỏng ngay khi một cái lỗi</td><td>Chỉ dùng khi cả lô là một đơn vị</td></tr></tbody></table>"
      },
      {
        title: "Tiêu chí chọn GPU",
        html: "<ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\"><li>Dữ liệu mỗi lần truyền từ vài chục MB trở lên.</li><li>Cường độ tính toán cao: nhiều phép tính trên mỗi byte.</li><li>Cùng dữ liệu được dùng qua nhiều kernel, ít truyền lại.</li><li>Tính được: truyền 12 ms + tính 4 ms so với 380 ms CPU.</li><li>Dưới 8 MB thì chạy CPU, đừng mở GPU.</li><li>Luôn so kết quả GPU với CPU trước khi tin.</li></ul>"
      },
      {
        title: "Mẫu xử lý lỗi bất đồng bộ",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>const withTimeout = (p, ms) =&gt;\n  Promise.race([\n    p,\n    new Promise((_, rej) =&gt;\n      setTimeout(() =&gt; rej(new Error('timeout')), ms))\n  ]);\n\nconst results = await Promise.allSettled(\n  urls.map((u) =&gt; withTimeout(fetchOrder(u), 800))\n);\nconst ok = results.filter(r =&gt; r.status === 'fulfilled');\nconst bad = results.filter(r =&gt; r.status === 'rejected');</code></pre></div><p>Hạn 800 ms mỗi lời gọi, 2.000 ms cho cả lô; hiển thị cả phần lỗi.</p>"
      }
    ]
  });
})();
