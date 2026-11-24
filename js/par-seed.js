/* ParallelLab — dữ liệu mô phỏng tăng tốc, băng thông và tranh chấp khóa */
window.PAR_SEED = {
  lab: {
    heading: "Ba câu hỏi của lập trình song song",
    intro: "Tính tăng tốc theo định luật Amdahl, đo hiệu suất bộ nhớ khi nhiều lõi cùng đòi băng thông và ước lượng thời gian chờ khóa. Engine viết tay, kết quả tất định để đối chiếu từng nhiệm vụ.",
    tabs: [
      {
        id: "speedup",
        label: "Tăng tốc",
        title: "Amdahl",
        badge: "x",
        runLabel: "Tính tăng tốc",
        hint: "Tăng tốc = 1 ÷ (phần tuần tự + phần song song ÷ số luồng + chi phí phối hợp). Phần tuần tự càng lớn, thêm luồng càng ít hiệu quả.",
        fields: [
          { id: "serialPct", label: "Phần tuần tự (%)", type: "number", min: 0, max: 90, step: 5, value: 20 },
          { id: "workers", label: "Số luồng", type: "number", min: 1, max: 64, step: 1, value: 8 },
          { id: "overheadPct", label: "Chi phí phối hợp (%)", type: "number", min: 0, max: 50, step: 5, value: 10 }
        ]
      },
      {
        id: "memory",
        label: "Bộ nhớ",
        title: "Băng thông dùng chung",
        badge: "GB/s",
        runLabel: "Đo hiệu suất",
        hint: "Nhu cầu = số lõi × băng thông mỗi lõi. Nếu nhu cầu vượt băng thông chung, hiệu suất giảm theo tỉ lệ băng thông chung chia nhu cầu.",
        fields: [
          { id: "cores", label: "Số lõi", type: "number", min: 2, max: 64, step: 2, value: 16 },
          { id: "bandwidthGBs", label: "Băng thông chung (GB/s)", type: "number", min: 20, max: 400, step: 10, value: 100 },
          { id: "perCoreGBs", label: "Nhu cầu mỗi lõi (GB/s)", type: "number", min: 1, max: 16, step: 1, value: 8 }
        ]
      },
      {
        id: "sync",
        label: "Đồng bộ",
        title: "Chờ khóa",
        badge: "ms",
        runLabel: "Tính thời gian chờ",
        hint: "Số thao tác phải khóa = số luồng × tỉ lệ khóa. Thời gian chờ = số thao tác × thời gian mỗi lần chờ; trên 1 giây là đáng lo.",
        fields: [
          { id: "threads", label: "Số luồng", type: "number", min: 2, max: 32, step: 1, value: 8 },
          { id: "lockPct", label: "Thao tác phải khóa (%)", type: "number", min: 0, max: 100, step: 5, value: 30 },
          { id: "waitMs", label: "Chờ mỗi lần (ms)", type: "number", min: 1, max: 50, step: 1, value: 5 }
        ]
      }
    ],
    defaults: {
      speedup: { serialPct: 20, workers: 8, overheadPct: 10 },
      memory: { cores: 16, bandwidthGBs: 100, perCoreGBs: 8 },
      sync: { threads: 8, lockPct: 30, waitMs: 5 }
    },
    presets: {
      speedup: [
        { id: "par-up-base", label: "20% tuần tự, 8 luồng", dataset: { serialPct: 20, workers: 8, overheadPct: 10 } },
        { id: "par-up-flat", label: "50% tuần tự, 16 luồng", dataset: { serialPct: 50, workers: 16, overheadPct: 0 } },
        { id: "par-up-high", label: "5% tuần tự, 32 luồng", dataset: { serialPct: 5, workers: 32, overheadPct: 5 } }
      ],
      memory: [
        { id: "par-mem-base", label: "16 lõi, 100 GB/s", dataset: { cores: 16, bandwidthGBs: 100, perCoreGBs: 8 } },
        { id: "par-mem-fit", label: "8 lõi vừa băng thông", dataset: { cores: 8, bandwidthGBs: 100, perCoreGBs: 8 } },
        { id: "par-mem-throttle", label: "32 lõi, nghẽn nặng", dataset: { cores: 32, bandwidthGBs: 60, perCoreGBs: 10 } }
      ],
      sync: [
        { id: "par-sync-base", label: "8 luồng, khóa 30%", dataset: { threads: 8, lockPct: 30, waitMs: 5 } },
        { id: "par-sync-ok", label: "Khóa 10%, chờ ít", dataset: { threads: 8, lockPct: 10, waitMs: 5 } },
        { id: "par-sync-bad", label: "16 luồng, khóa 60%", dataset: { threads: 16, lockPct: 60, waitMs: 5 } }
      ]
    },
    examples: [
      { id: "ex-speedup", kind: "speedup", label: "50% tuần tự thì 16 luồng được mấy lần?", dataset: { serialPct: 50, workers: 16, overheadPct: 0 } },
      { id: "ex-memory", kind: "memory", label: "32 lõi đòi 10 GB/s mỗi lõi", dataset: { cores: 32, bandwidthGBs: 60, perCoreGBs: 10 } },
      { id: "ex-sync", kind: "sync", label: "16 luồng, 60% thao tác khóa", dataset: { threads: 16, lockPct: 60, waitMs: 5 } }
    ],
    missions: [
      {
        id: "m-speedup-base",
        kind: "speedup",
        title: "Tăng tốc cơ bản",
        prompt: "20% tuần tự, 8 luồng, chi phí phối hợp 10%. Ghi lại hệ số tăng tốc (1 chữ số thập phân).",
        metric: "speedup",
        expect: 2.5,
        hint: "0,2 + 0,8 ÷ 8 + 0,1 = 0,4; 1 ÷ 0,4 = 2,5 lần.",
        dataset: { serialPct: 20, workers: 8, overheadPct: 10 }
      },
      {
        id: "m-speedup-serial",
        kind: "speedup",
        title: "Nửa chương trình tuần tự",
        prompt: "50% tuần tự, 16 luồng, không có chi phí phối hợp. Ghi lại hệ số tăng tốc (1 chữ số thập phân).",
        metric: "speedup",
        expect: 1.9,
        hint: "0,5 + 0,5 ÷ 16 = 0,53125; 1 ÷ 0,53125 ≈ 1,88 → 1,9.",
        dataset: { serialPct: 50, workers: 16, overheadPct: 0 }
      },
      {
        id: "m-memory-eff",
        kind: "memory",
        title: "Hiệu suất bộ nhớ",
        prompt: "16 lõi, mỗi lõi cần 8 GB/s, băng thông chung 100 GB/s. Ghi lại hiệu suất phần trăm (1 chữ số thập phân).",
        metric: "efficiency",
        expect: 78.1,
        hint: "Nhu cầu 128 GB/s; 100 ÷ 128 = 78,125% → 78,1.",
        dataset: { cores: 16, bandwidthGBs: 100, perCoreGBs: 8 }
      },
      {
        id: "m-memory-ok",
        kind: "memory",
        title: "Vừa đủ băng thông",
        prompt: "8 lõi, mỗi lõi 8 GB/s, băng thông chung 100 GB/s. Engine phải kết luận không nghẽn.",
        metric: "ok",
        expect: 1,
        hint: "Nhu cầu 64 GB/s, thấp hơn 100 GB/s nên hiệu suất 100%.",
        dataset: { cores: 8, bandwidthGBs: 100, perCoreGBs: 8 }
      },
      {
        id: "m-sync-ms",
        kind: "sync",
        title: "Thời gian chờ khóa",
        prompt: "8 luồng, 30% thao tác phải khóa, mỗi lần chờ 5 ms. Ghi lại thời gian chờ mỗi luồng (ms).",
        metric: "waitMs",
        expect: 1200,
        hint: "8 × 30 = 240 thao tác; 240 × 5 = 1.200 ms.",
        dataset: { threads: 8, lockPct: 30, waitMs: 5 }
      },
      {
        id: "m-sync-ok",
        kind: "sync",
        title: "Chờ dưới một giây",
        prompt: "8 luồng, 10% thao tác phải khóa, mỗi lần 5 ms. Engine phải kết luận chờ dưới 1 giây.",
        metric: "ok",
        expect: 1,
        hint: "8 × 10 × 5 = 400 ms, dưới 1.000 ms.",
        dataset: { threads: 8, lockPct: 10, waitMs: 5 }
      }
    ]
  }
};

window.PAR_SEED.home = {
  "title": "ParallelLab — Tính toán song song, nhìn thấy từng bước",
  "eyebrow": "Khóa học tương tác · 12 bài · tiếng Việt",
  "h1": "Một tác vụ lớn.<br><span class=\"hl\">Thấy</span> cả tốc độ.",
  "sub": "Đi từ luồng, tranh chấp dữ liệu, khóa đến nhóm tác vụ, GPU và tăng tốc Amdahl. Mỗi bài là <strong>một sơ đồ sống</strong>, còn phòng mô phỏng tính hệ số tăng tốc, hiệu suất bộ nhớ và thời gian chờ khóa ngay trong trình duyệt — không cần cài đặt.",
  "note": "Không backend. Số liệu mô phỏng và tiến độ nằm trên máy bạn.",
  "startLabel": "Bắt đầu bài 01",
  "labLabel": "Mở phòng mô phỏng",
  "modesHead": "Bốn cách học, một bài toán song song",
  "modesSub": "Không chỉ đọc định nghĩa luồng. Bạn xem một tác vụ được chia, chạy, đồng bộ và gộp kết quả, kèm một phép đo cụ thể để đối chiếu.",
  "modes": [
    {
      "title": "Học bằng sơ đồ sống",
      "desc": "Từng luồng, vùng dữ liệu chung và điểm đồng bộ hiện ra theo bước, kèm một bài toán tính điểm ảnh cụ thể để đối chiếu.",
      "href": "#/learn",
      "icon": "process",
      "tone": "blue",
      "cta": "Vào lớp học"
    },
    {
      "title": "Luyện tập tình huống",
      "desc": "8 ca thường gặp: tranh chấp dữ liệu, khóa quá rộng, băng thông nghẽn và tăng tốc không như kỳ vọng.",
      "href": "#/practice",
      "icon": "star",
      "tone": "coral",
      "cta": "Bắt đầu luyện"
    },
    {
      "title": "Phòng mô phỏng",
      "desc": "Tính tăng tốc theo Amdahl, hiệu suất băng thông chung và thời gian chờ khóa, kèm 6 nhiệm vụ.",
      "href": "#/lab",
      "icon": "gateway",
      "tone": "violet",
      "cta": "Mở phòng mô phỏng"
    },
    {
      "title": "Cheatsheets",
      "desc": "Bảng công thức Amdahl, mẫu khóa và nhóm tác vụ, checklist tránh deadlock — tra nhanh khi làm bài.",
      "href": "#/cheatsheets",
      "icon": "file",
      "tone": "green",
      "cta": "Mở bảng tra"
    }
  ],
  "outlineHead": "Lộ trình 12 bài",
  "outlineSub": "Từ luồng đầu tiên đến bản tối ưu: mỗi module trả lời một câu hỏi lớn của tính toán song song.",
  "faq": [
    {
      "q": "Đây có phải môi trường chạy đa luồng thật?",
      "a": "Không. Đây là mô phỏng viết tay cho khóa học: tính tăng tốc, hiệu suất bộ nhớ và thời gian chờ khóa. Đủ để thấy vì sao thêm luồng không luôn nhanh hơn — không thay thế OpenMP, CUDA hay một máy nhiều lõi thật."
    },
    {
      "q": "Vì sao số liệu mẫu cố định?",
      "a": "Dữ liệu cố định để kết quả tất định và dễ đối chiếu: 20% tuần tự, 8 luồng, 100 GB/s. Nhờ vậy nhiệm vụ có đáp án kiểm chứng được, không phụ thuộc lịch chạy của hệ điều hành."
    },
    {
      "q": "Có cần biết C hay Python trước không?",
      "a": "Không bắt buộc. Bài học giải thích bằng sơ đồ và ví dụ; mẫu mã và bảng công thức nằm ở cheatsheet để tra khi cần. Người đã quen một ngôn ngữ sẽ đi nhanh hơn ở phần đồng bộ."
    },
    {
      "q": "Dùng trên điện thoại hoặc máy chiếu được không?",
      "a": "Được. Giao diện responsive, thanh bên chuyển thành drawer và sơ đồ cuộn ngang trên màn hình nhỏ. Bảng kết quả vẫn đọc được; nên xoay ngang khi xem nhiều cột."
    }
  ],
  "letter": "P",
  "brand": "ParallelLab",
  "hero": {
    "bar": "par://worker/queue",
    "title": "chia việc · chạy · đồng bộ · gộp",
    "aria": "Tác vụ được chia cho các luồng, chạy song song, đồng bộ rồi gộp kết quả",
    "states": [
      {
        "label": "Chia việc"
      },
      {
        "label": "Chạy"
      },
      {
        "label": "Đồng bộ"
      },
      {
        "label": "Gộp"
      }
    ],
    "final": "OK",
    "queueSmall": "Kết quả",
    "queueChip": "2,5x",
    "queueVerdict": "8 luồng",
    "frames": [
      {
        "small": "Tăng tốc",
        "b": "2,5x",
        "cls": "hit"
      },
      {
        "small": "Băng thông",
        "b": "78%"
      },
      {
        "small": "Chờ khóa",
        "b": "1.200 ms",
        "cls": "miss"
      }
    ]
  },
  "promo": {
    "eyebrow": "Phòng mô phỏng · chạy cục bộ",
    "h2": "Một tác vụ.<br>Ba nút thắt.",
    "p": "Tính hệ số tăng tốc theo định luật Amdahl, đo hiệu suất khi nhiều lõi tranh băng thông và ước lượng thời gian chờ khóa. Sáu nhiệm vụ chấm điểm ngay trên kết quả, kèm gợi ý sửa từng cấu hình yếu.",
    "cta": "Mở phòng mô phỏng",
    "nodes": [
      {
        "icon": "task",
        "label": "Tác vụ",
        "sub": "chia nhỏ",
        "hot": true
      },
      {
        "icon": "layers",
        "label": "Luồng",
        "sub": "8 worker"
      },
      {
        "icon": "bolt",
        "label": "Chạy",
        "sub": "song song"
      },
      {
        "icon": "memory",
        "label": "Bộ nhớ",
        "sub": "dùng chung",
        "hot": true
      },
      {
        "icon": "key",
        "label": "Khóa",
        "sub": "đồng bộ"
      },
      {
        "icon": "alert",
        "label": "Deadlock",
        "sub": "chặn"
      },
      {
        "icon": "check",
        "label": "Gộp",
        "sub": "kết quả"
      }
    ]
  }
};
window.PARALLELLAB = window.PARALLELLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };
window.PARALLELLAB.home = window.PAR_SEED.home;

(function () {
  const D = window.PARALLELLAB;
  if (!D) return;
  Object.values(D.lessons || {}).forEach((lesson) => {
    (lesson.steps || []).forEach((step) => {
      if (Array.isArray(step.metrics)) {
        const keyed = {};
        step.metrics.forEach((m) => { if (m && m.key != null) keyed[m.key] = m.value; });
        step.metrics = keyed;
      }
      if (Array.isArray(step.changes)) {
        step.changes = step.changes.map((c) => {
          if (!c || typeof c !== "object") return String(c);
          if (c.before && c.after) return c.label + ": " + c.before + " thành " + c.after;
          return String(c.label || c.after || "");
        });
      }
    });
  });
  (D.cheatsheets || []).forEach((sheet) => {
    (sheet.cards || []).forEach((card) => { if (!card.html && card.body) card.html = card.body; });
  });
})();

(function () {
  const D = window.PARALLELLAB;
  if (!D) return;
  D.practice.push(
    {
      id: "par-practice-bandwidth",
      module: "hieu-nang-va-an-toan",
      tag: "MEMORY",
      title: "Mười sáu lõi tranh một kênh nhớ",
      scenario: "Máy chủ chạy 16 lõi, mỗi lõi cần 8 GB/s để xử lý ảnh. Kênh bộ nhớ chung chỉ đáp ứng 100 GB/s. Kỹ sư đo thấy thời gian xử lý tăng gần gấp đôi so với chạy 8 lõi, dù số lõi gấp đôi. Nhóm cần giải thích nguyên nhân trước khi mua thêm máy. Hãy chọn cách đọc đúng nhất về hiện tượng này.",
      metrics: [
        { label: "Số lõi", value: "16" },
        { label: "Nhu cầu", value: "128 GB/s" },
        { label: "Băng thông chung", value: "100 GB/s" }
      ],
      options: [
        "Nhu cầu 128 GB/s vượt 100 GB/s nên hiệu suất chỉ còn khoảng 78%, thêm lõi không tăng tỉ lệ",
        "Hệ điều hành chưa bật đủ lõi nên cần cấu hình lại",
        "Băng thông chung 100 GB/s đủ cho 16 lõi vì mỗi lõi chỉ dùng 8 GB/s",
        "Tăng số lõi lên 32 sẽ khôi phục hiệu suất như cũ"
      ],
      correct: 0,
      explain: "Nhu cầu bộ nhớ là 16 × 8 = 128 GB/s, vượt băng thông chung 100 GB/s. Khi nghẽn, mỗi lõi chỉ nhận được 100 ÷ 128 khoảng 78% nhu cầu, nên thời gian xử lý dài ra và thêm lõi không còn hiệu quả. Cách xử lý là giảm nhu cầu mỗi lõi bằng cache cục bộ, tăng số kênh nhớ hoặc chia tác vụ sang máy khác."
    },
    {
      id: "par-practice-profile",
      module: "hieu-nang-va-an-toan",
      tag: "PROFILE",
      title: "Chọn chỗ tối ưu từ profiler",
      scenario: "Một tác vụ chạy 1.000 ms thời gian tường, trong đó CPU bận 900 ms. Profiler cho thấy một hàm chiếm 45% thời gian CPU, các hàm còn lại đều dưới 5%. Nhóm có ba ngày để cải thiện và muốn chọn việc có lợi nhất trước. Hãy chọn hành động đúng nhất dựa trên số liệu đã đo.",
      metrics: [
        { label: "Thời gian tường", value: "1.000 ms" },
        { label: "Thời gian CPU", value: "900 ms" },
        { label: "Hàm nóng nhất", value: "45%" }
      ],
      options: [
        "Tối ưu hàm chiếm 45% CPU trước vì đây là điểm nóng lớn nhất",
        "Tăng gấp đôi số luồng để chia đều mọi hàm",
        "Thêm bộ nhớ đệm cho toàn bộ chương trình",
        "Giảm thời gian tường bằng cách bỏ qua bước đo"
      ],
      correct: 0,
      explain: "Hàm chiếm 45% CPU là điểm nóng lớn nhất, nên tối ưu ở đây cho lợi ích cao nhất trên mỗi giờ công. Tăng luồng chỉ hiệu quả khi tác vụ chia được và không tranh chấp; thêm bộ nhớ đệm tràn lan dễ tốn công mà ít lợi. Sau khi sửa, cần đo lại cùng bộ số liệu để so sánh trước và sau."
    }
  );
})();
