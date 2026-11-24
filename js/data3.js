/* ParallelLab — phần 3: hiệu năng, bộ nhớ, bế tắc, đo lường, tình huống và cheatsheet */
window.PARALLELLAB = window.PARALLELLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };

(function () {
  const P = window.PARALLELLAB;

  P.modules.push({
    id: "hieu-nang-va-an-toan",
    num: "03",
    title: "Hiệu năng và an toàn",
    tone: "yellow",
    blurb: "Bốn bài trong module trả lời câu hỏi thực tế nhất khi chạy song song: nhanh hơn bao nhiêu lần, có nghẽn băng thông không, làm sao tránh bế tắc, và đo hiệu năng thế nào cho đúng. Mỗi bài có sơ đồ, số liệu và checklist áp dụng ngay.",
    lessons: ["speedup", "memory", "deadlock", "profiling"]
  });

  P.lessons["speedup"] = {
    id: "speedup",
    module: "hieu-nang-va-an-toan",
    title: "Tăng tốc Amdahl",
    shortTitle: "Tăng tốc Amdahl",
    subtitle: "Vì sao thêm luồng không nhanh thêm",
    blurb: "Định luật Amdahl giải thích vì sao thêm luồng chóng hết tác dụng. Bài này tính tăng tốc cho hai cấu hình, chỉ ra 10% chi phí phối hợp lấy đi một phần tư lợi ích, rồi chỉ cách tìm phần tuần tự.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["Amdahl", "tăng tốc", "phần tuần tự", "luồng", "chi phí phối hợp"],
    metrics: [
      { key: "serialPct", label: "Phần tuần tự", tone: "coral" },
      { key: "workers", label: "Số luồng", tone: "blue" },
      { key: "speedup", label: "Tăng tốc", tone: "mint" },
      { key: "ok", label: "Đánh giá", tone: "yellow" }
    ],
    nodes: [
      { id: "code", type: "code", x: 55, y: 80, w: 200, h: 70, label: "Mã chương trình", sub: "20% chạy tuần tự" },
      { id: "split", type: "grid", x: 340, y: 80, w: 200, h: 70, label: "Chia việc", sub: "80% cho 8 luồng" },
      { id: "pool", type: "server", x: 625, y: 80, w: 200, h: 70, label: "Bể 8 luồng", sub: "chạy phần song song" },
      { id: "merge", type: "layers", x: 340, y: 310, w: 200, h: 70, label: "Gộp kết quả", sub: "chờ luồng chậm nhất" },
      { id: "dur", type: "clock", x: 55, y: 310, w: 200, h: 70, label: "Thời gian tường", sub: "1,0 giây xuống 0,4" },
      { id: "limit", type: "alert", x: 625, y: 310, w: 200, h: 70, label: "Trần Amdahl", sub: "tối đa 5 lần" },
      { id: "coord", type: "signal", x: 340, y: 195, w: 200, h: 70, label: "Phối hợp 10%", sub: "đồng bộ và hàng đợi" }
    ],
    edges: [
      { id: "code-split", from: "code", to: "split", kind: "request", label: "chia 80%" },
      { id: "split-pool", from: "split", to: "pool", kind: "control", label: "giao 8 phần", bow: 22 },
      { id: "pool-split", from: "pool", to: "split", kind: "response", label: "báo xong", bow: -22 },
      { id: "pool-merge", from: "pool", to: "merge", kind: "data", label: "kết quả riêng" },
      { id: "merge-dur", from: "merge", to: "dur", kind: "data", label: "0,4 giây" },
      { id: "limit-dur", from: "limit", to: "dur", kind: "response", label: "chặn trên 5 lần" },
      { id: "coord-merge", from: "coord", to: "merge", kind: "control", label: "10% chi phí" }
    ],
    learn: [
      "Tăng tốc bị chặn bởi <strong>phần tuần tự</strong>, không bởi số luồng.",
      "Công thức Amdahl: <code>1 / (s + (1 - s) / n)</code>.",
      "20% tuần tự đặt trần 5 lần, dù chạy bao nhiêu luồng.",
      "Chi phí phối hợp 10% kéo 3,3 lần xuống còn <strong>2,5 lần</strong>."
    ],
    steps: [
      {
        short: "Trần của Amdahl",
        type: "concept",
        title: "Phần tuần tự quyết định trần",
        body: "Định luật Amdahl nhìn chương trình như hai phần: phần chạy song song được và phần buộc phải chạy tuần tự. Nếu 20% thời gian là tuần tự, dù có bao nhiêu luồng, phần đó vẫn chiếm 20% và chặn mức tăng tốc tối đa ở 5 lần. Công thức là <code>1 / (s + (1 - s) / n)</code>, với s là tỉ lệ tuần tự và n là số luồng. Với s bằng 0,2 và n bằng 8, mẫu số là 0,3 nên tăng tốc khoảng 3,3 lần. Con số này không phụ thuộc chất lượng mã song song, chỉ phụ thuộc phần tuần tự. Vì vậy câu hỏi đầu tiên khi tối ưu không phải thêm luồng, mà là phần tuần tự đang nằm ở đâu.",
        focus: ["code", "split", "limit"],
        edges: ["code-split", "limit-dur"],
        metrics: { serialPct: "20%", workers: "1", speedup: "1,0 lần", ok: "mốc gốc" },
        changes: [
          { label: "Cách nhìn", before: "chạy càng nhiều luồng càng nhanh", after: "tăng tốc bị chặn bởi phần tuần tự" },
          { label: "Mục tiêu tối ưu", before: "tăng số luồng", after: "giảm tỉ lệ tuần tự" }
        ],
        note: "Trần 5 lần là giới hạn toán học, không phải giới hạn phần cứng."
      },
      {
        short: "Tám luồng",
        type: "flow",
        title: "Chia 80% cho tám luồng",
        body: "Với 20% tuần tự, phần song song chiếm 0,8 giây trong tổng 1 giây. Chia đều cho 8 luồng thì mỗi luồng chạy 0,1 giây, cộng 0,2 giây tuần tự thành 0,3 giây, tức tăng tốc 3,3 lần. Đây là trường hợp lý tưởng, chưa tính chi phí giao việc và gộp kết quả. Trong thực tế, hàng đợi công việc, khóa bảo vệ bộ đếm và bước gộp đều tốn thời gian. Nếu mỗi luồng phải chờ luồng chậm nhất ở cuối, một tác vụ dài bất thường sẽ kéo cả bước xuống. Vì vậy chia việc đều không đủ; cần chia nhỏ đều tay và tránh để một luồng ôm phần nặng nhất.",
        focus: ["split", "pool", "merge"],
        edges: ["split-pool", "pool-split", "pool-merge"],
        metrics: { serialPct: "20%", workers: "8", speedup: "3,3 lần", ok: "gần trần" },
        changes: [
          { label: "Thời gian", before: "1,0 giây một luồng", after: "0,3 giây với 8 luồng" },
          { label: "Cách chia", before: "một luồng làm hết", after: "8 phần đều nhau" }
        ],
        note: "Chia càng nhỏ thì chi phí giao việc càng lớn; cần điểm cân bằng."
      },
      {
        short: "Cộng 10% phối hợp",
        type: "detail",
        title: "Mười phần trăm đắt hơn tưởng",
        body: "Ba khoản chi phí thường bị bỏ quên: đồng bộ hóa, hàng đợi và bước gộp. Giả sử chúng cộng thêm 10% thời gian, mẫu số Amdahl thành 0,2 + 0,1 + 0,1 bằng 0,4, nên tăng tốc chỉ còn 2,5 lần thay vì 3,3 lần. Chỉ 10% chi phí đã lấy đi gần một phần tư lợi ích. Trong mã thật, chi phí này lớn dần khi số luồng tăng, vì mỗi luồng phải tranh khóa và ghi vào bộ đếm chung. Cách giảm là gộp cục bộ theo luồng rồi mới cộng một lần, dùng <code>atomic</code> thay khóa, và tránh chia việc quá nhỏ khiến chi phí giao việc lớn hơn việc thật.",
        focus: ["coord", "merge", "dur"],
        edges: ["coord-merge", "merge-dur"],
        metrics: { serialPct: "20%", workers: "8", speedup: "2,5 lần", ok: "giảm 25%" },
        changes: [
          { label: "Chi phí phối hợp", before: "chưa tính", after: "10% tổng thời gian" },
          { label: "Tăng tốc thực", before: "3,3 lần", after: "2,5 lần" }
        ],
        note: "Hai khoản 10% cộng lại thành 20% thời gian, tương đương phần tuần tự."
      },
      {
        short: "Nửa tuần tự",
        type: "pitfall",
        title: "50% tuần tự thì 16 luồng vô ích",
        body: "Nếu nửa chương trình là tuần tự, 16 luồng gần như vô ích. Mẫu số là 0,5 + 0,5/16, khoảng 0,531, nên tăng tốc chỉ 1,9 lần. Thêm 8 luồng nữa cũng chỉ tiến thêm vài phần trăm, vì trần của trường hợp này là 2 lần. Đây là lý do một số nhóm tăng gấp bốn số luồng mà thời gian chạy gần như không đổi, rồi kết luận sai là máy chủ yếu. Với 16 lõi, phần song song chỉ còn 3% tổng thời gian, nên mọi nỗ lực nên dồn vào 50% tuần tự kia: đọc tệp, phân tích cấu hình, hoặc ghi kết quả bằng một luồng. Tối ưu đúng chỗ rẻ hơn nhiều so với mua thêm lõi.",
        focus: ["limit", "pool", "dur"],
        edges: ["limit-dur", "pool-merge"],
        metrics: { serialPct: "50%", workers: "16", speedup: "1,9 lần", ok: "gần như dừng" },
        changes: [
          { label: "Số luồng", before: "8 luồng", after: "16 luồng, nhanh thêm 5%" },
          { label: "Hướng tối ưu", before: "mua thêm lõi", after: "cắt phần tuần tự" }
        ],
        note: "Khi đường cong tăng tốc đi ngang, thêm luồng chỉ thêm điện năng."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Checklist tăng tốc",
        tone: "final",
        body: "Chốt lại quy trình: đo thời gian chạy một luồng, tách phần tuần tự và phần song song, rồi tính trần Amdahl trước khi viết mã. Với 20% tuần tự, trần là 5 lần; đừng kỳ vọng 8 lần khi có 8 luồng. Đo cả chi phí phối hợp, vì 10% đủ làm tăng tốc rơi từ 3,3 xuống 2,5 lần. Chọn số luồng theo điểm đo, không theo số lõi trên hộp. Nếu tăng luồng mà thời gian không đổi, hãy tìm phần tuần tự thay vì thêm luồng. Ghi lại số đo trước và sau mỗi thay đổi, cùng cấu hình máy, để so sánh công bằng. Mục tiêu là giảm phần tuần tự, không phải tăng số luồng.",
        focus: "all",
        edges: "all",
        metrics: { serialPct: "20%", workers: "8", speedup: "2,5 lần", ok: "ổn định" },
        changes: [
          { label: "Quy trình", before: "thử luồng theo cảm tính", after: "tính trần rồi mới chọn số luồng" },
          { label: "Số đo", before: "chỉ nhìn thời gian chạy", after: "ghi cả thời gian và chi phí phối hợp" }
        ],
        note: "Giảm phần tuần tự từ 20% xuống 10% đưa trần từ 5 lên 10 lần."
      }
    ]
  };

  P.lessons["memory"] = {
    id: "memory",
    module: "hieu-nang-va-an-toan",
    title: "Băng thông bộ nhớ",
    shortTitle: "Băng thông",
    subtitle: "Khi thêm lõi không thêm tốc độ",
    blurb: "Mỗi lõi đọc dữ liệu, nhưng cả máy dùng chung một ống băng thông. Bài này tính nhu cầu 16 lõi nhân 8 GB/s trên 100 GB/s, giải thích vì sao chỉ đạt 78,1% hiệu suất, và khi nào thêm lõi là vô ích.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["băng thông", "bộ nhớ", "NUMA", "số lõi", "nghẽn"],
    metrics: [
      { key: "cores", label: "Số lõi", tone: "blue" },
      { key: "demandGBs", label: "Nhu cầu (GB/s)", tone: "yellow" },
      { key: "efficiency", label: "Hiệu suất", tone: "mint" },
      { key: "ok", label: "Trạng thái", tone: "coral" }
    ],
    nodes: [
      { id: "cores", type: "grid", x: 55, y: 80, w: 200, h: 70, label: "16 lõi", sub: "mỗi lõi 8 GB/s" },
      { id: "bus", type: "layers", x: 340, y: 80, w: 200, h: 70, label: "Kênh băng thông", sub: "100 GB/s dùng chung" },
      { id: "ram", type: "memory", x: 625, y: 80, w: 200, h: 70, label: "RAM DDR5", sub: "hai kênh, 100 GB/s" },
      { id: "hot", type: "bolt", x: 55, y: 310, w: 200, h: 70, label: "Vòng lặp nóng", sub: "duyệt mảng lớn" },
      { id: "wait", type: "clock", x: 625, y: 310, w: 200, h: 70, label: "Lõi chờ dữ liệu", sub: "dừng 22% thời gian" },
      { id: "eff", type: "check", x: 340, y: 310, w: 200, h: 70, label: "Hiệu suất 78,1%", sub: "100 trên 128 GB/s" },
      { id: "cache", type: "grid", x: 340, y: 195, w: 200, h: 70, label: "Bộ đệm L3", sub: "32 MB dùng chung" }
    ],
    edges: [
      { id: "cores-bus", from: "cores", to: "bus", kind: "request", label: "xin 128 GB/s", bow: 22 },
      { id: "bus-cores", from: "bus", to: "cores", kind: "response", label: "cấp 100 GB/s", bow: -22 },
      { id: "bus-ram", from: "bus", to: "ram", kind: "data", label: "đọc theo kênh" },
      { id: "hot-cores", from: "hot", to: "cores", kind: "control", label: "chạy vòng lặp" },
      { id: "bus-wait", from: "bus", to: "wait", kind: "control", label: "xếp hàng" },
      { id: "wait-eff", from: "wait", to: "eff", kind: "data", label: "đo hiệu suất" },
      { id: "bus-cache", from: "bus", to: "cache", kind: "data", label: "tra L3 trước" }
    ],
    learn: [
      "Băng thông là tài nguyên <strong>chia sẻ</strong>, không cộng dồn theo lõi.",
      "16 lõi nhân 8 GB/s bằng 128 GB/s, vượt kênh 100 GB/s.",
      "Hiệu suất bằng <code>100 / 128</code>, tức 78,1%, phần còn lại là chờ.",
      "8 lõi cần 64 GB/s nên không nghẽn; 32 lõi chỉ còn 39,1%."
    ],
    steps: [
      {
        short: "Một ống chung",
        type: "concept",
        title: "Một ống nước dùng chung",
        body: "Mỗi lõi không tự sinh dữ liệu; nó đọc từ RAM qua một đường băng thông chung. Hãy hình dung 16 vòi cùng lấy nước từ một ống: mỗi vòi mở 8 lít mỗi giây thì cần 128 lít, nhưng ống chỉ tải được 100 lít. Khi tổng nhu cầu vượt dung lượng, các lõi phải xếp hàng và thời gian chờ xuất hiện ngay trong vòng lặp tính toán. Với bài toán ít truy cập bộ nhớ, ví dụ tính trên dữ liệu nhỏ nằm trong bộ đệm, nhu cầu thấp nên chưa gặp hiện tượng này. Ngược lại, duyệt mảng lớn, sao chép tệp hay nhân ma trận lớn đều đẩy nhu cầu lên sát trần. Hãy đo băng thông thực tế trước khi chọn số lõi.",
        focus: ["cores", "bus", "ram"],
        edges: ["cores-bus", "bus-ram"],
        metrics: { cores: "16", demandGBs: "128", efficiency: "100%", ok: "lý thuyết" },
        changes: [
          { label: "Cách nhìn", before: "mỗi lõi có băng thông riêng", after: "cả máy chia một kênh chung" },
          { label: "Điều kiện nghẽn", before: "chưa xét", after: "nhu cầu vượt 100 GB/s" }
        ],
        note: "Nghẽn băng thông không báo lỗi; nó chỉ làm mọi thứ chậm đều."
      },
      {
        short: "16 lõi, 128 GB/s",
        type: "flow",
        title: "Mười sáu lõi đòi 128 GB/s",
        body: "Với 16 lõi và 8 GB/s mỗi lõi, tổng nhu cầu là 128 GB/s, trong khi kênh bộ nhớ chỉ đáp ứng 100 GB/s. Tỉ lệ đáp ứng là 100 chia 128, tức 78,1%, nên mỗi lõi chỉ nhận khoảng 6,25 GB/s thay vì 8 GB/s. Thời gian chờ chiếm hơn 20% và tăng tốc thực tế thấp hơn tính toán lý thuyết. Điều này không có nghĩa 16 lõi vô dụng, mà là bài toán đang bị giới hạn bởi bộ nhớ. Cách xử lý gồm chia khối để dữ liệu vừa bộ đệm L3, dùng <code>prefetch</code> để che độ trễ, hoặc chuyển sang cấu trúc dữ liệu gọn hơn. Nếu vẫn nghẽn, giảm số lõi tham gia lại hiệu quả hơn.",
        focus: ["cores", "bus", "eff"],
        edges: ["cores-bus", "bus-cores", "wait-eff"],
        metrics: { cores: "16", demandGBs: "128", efficiency: "78,1%", ok: "nghẽn nhẹ" },
        changes: [
          { label: "Băng thông mỗi lõi", before: "8 GB/s", after: "6,25 GB/s" },
          { label: "Thời gian", before: "tính theo lý thuyết", after: "chậm thêm hơn 20%" }
        ],
        note: "78,1% là tỉ lệ đáp ứng, không phải tỉ lệ tăng tốc."
      },
      {
        short: "Tám lõi thì vừa",
        type: "detail",
        title: "Tám lõi vừa đúng nhu cầu",
        body: "Giảm còn 8 lõi, nhu cầu là 64 GB/s, thấp hơn 100 GB/s nên không nghẽn; mỗi lõi nhận đủ 8 GB/s và hiệu suất đạt 100%. Đây là điểm cân bằng: số lõi vừa với băng thông thì tăng tốc gần tuyến tính. Trên máy hai socket, băng thông lại phụ thuộc vị trí dữ liệu so với socket, nên một luồng đọc vùng nhớ của socket kia sẽ chậm hơn rõ rệt. Cách giảm là gắn luồng với lõi và cấp phát bộ nhớ cục bộ theo NUMA. Với 8 lõi, thời gian chạy có thể chỉ bằng một nửa so với 16 lõi nghẽn, dù dùng ít tài nguyên hơn. Hãy đo cả thông lượng lẫn độ trễ để chọn.",
        focus: ["cores", "ram", "cache"],
        edges: ["bus-ram", "bus-cache"],
        metrics: { cores: "8", demandGBs: "64", efficiency: "100%", ok: "không nghẽn" },
        changes: [
          { label: "Nhu cầu", before: "128 GB/s", after: "64 GB/s" },
          { label: "Hiệu suất", before: "78,1%", after: "100%" }
        ],
        note: "Trên máy nhiều socket, hãy gắn luồng với vùng nhớ cục bộ."
      },
      {
        short: "32 lõi nghẽn nặng",
        type: "pitfall",
        title: "Ba mươi hai lõi làm chậm hệ",
        body: "Tăng lên 32 lõi với cùng 8 GB/s mỗi lõi đẩy nhu cầu lên 256 GB/s, gấp 2,56 lần dung lượng, nên hiệu suất chỉ còn khoảng 39,1%. Thêm lõi lúc này làm chậm cả hệ: tranh chấp trên kênh nhớ, hàng đợi đầy, và thời gian chờ làm thời gian chạy dài hơn. Một lỗi hay gặp là đặt số luồng bằng số lõi phần cứng cho mọi bài toán, trong khi bài toán duyệt mảng lớn chỉ cần vài luồng là bão hòa. Hãy đo thông lượng theo số luồng và tìm điểm gãy. Nếu đường cong đi ngang hoặc đi xuống, dừng tăng luồng. Với bài toán nặng tính toán, nhu cầu mỗi lõi thấp hơn nhiều nên có thể dùng hết 32 lõi.",
        focus: ["cores", "bus", "wait"],
        edges: ["cores-bus", "bus-wait"],
        metrics: { cores: "32", demandGBs: "256", efficiency: "39,1%", ok: "nghẽn nặng" },
        changes: [
          { label: "Nhu cầu", before: "128 GB/s", after: "256 GB/s" },
          { label: "Hiệu suất", before: "78,1%", after: "39,1%" }
        ],
        note: "Số luồng bằng số lõi chỉ đúng với bài toán nặng tính toán."
      },
      {
        short: "Chọn theo băng thông",
        type: "final",
        title: "Chọn số lõi theo băng thông",
        tone: "final",
        body: "Chốt lại: băng thông là tài nguyên chia sẻ, không phải tổng của các lõi. Trước khi chọn số luồng, hãy đo băng thông khả dụng và nhu cầu thật của một lõi. Quy tắc nhanh là số lõi hữu ích bằng băng thông chia nhu cầu mỗi lõi; với 100 GB/s và 8 GB/s, con số đó là 12, không phải 32. Giữ dữ liệu nóng trong bộ đệm, chia khối theo cache line, tránh chia sẻ dữ liệu ghi giữa các lõi. Trên máy nhiều socket, gắn luồng với vùng nhớ cục bộ. Ghi lại thông lượng, độ trễ và hiệu suất trước sau mỗi lần đổi cấu hình. Hiệu suất 78,1% có thể chấp nhận, nhưng 39,1% thì nên giảm lõi.",
        focus: "all",
        edges: "all",
        metrics: { cores: "12", demandGBs: "96", efficiency: "100%", ok: "vừa đủ" },
        changes: [
          { label: "Số lõi", before: "16 hoặc 32", after: "12 lõi, vừa 100 GB/s" },
          { label: "Cách chọn", before: "theo số lõi phần cứng", after: "theo băng thông đo được" }
        ],
        note: "Mười hai lõi nhân 8 GB/s bằng 96 GB/s, vẫn dưới trần 100 GB/s."
      }
    ]
  };

  P.lessons["deadlock"] = {
    id: "deadlock",
    module: "hieu-nang-va-an-toan",
    title: "Bế tắc",
    shortTitle: "Bế tắc",
    subtitle: "Bốn điều kiện Coffman và cách phá",
    blurb: "Bế tắc xảy ra khi hai luồng mỗi bên giữ một khóa và cùng chờ khóa còn lại. Bài này soi bốn điều kiện Coffman, dựng lại vòng chờ, rồi phá vòng bằng thứ tự khóa cố định và chờ có thời hạn.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["bế tắc", "khóa", "Coffman", "thứ tự khóa", "chờ"],
    metrics: [
      { key: "threads", label: "Số luồng", tone: "blue" },
      { key: "locks", label: "Số khóa", tone: "yellow" },
      { key: "cycles", label: "Chu trình chờ", tone: "coral" },
      { key: "ok", label: "Trạng thái", tone: "mint" }
    ],
    nodes: [
      { id: "t1", type: "task", x: 55, y: 80, w: 200, h: 70, label: "Luồng A", sub: "chuyển 1 sang 2" },
      { id: "watch", type: "clock", x: 340, y: 80, w: 200, h: 70, label: "Chờ có thời hạn", sub: "500 ms rồi nhả" },
      { id: "t2", type: "task", x: 625, y: 80, w: 200, h: 70, label: "Luồng B", sub: "chuyển 2 sang 1" },
      { id: "lockA", type: "key", x: 55, y: 310, w: 200, h: 70, label: "Khóa tài khoản 1", sub: "A đang giữ" },
      { id: "wait", type: "alert", x: 340, y: 310, w: 200, h: 70, label: "Chu trình chờ", sub: "hai bên chờ nhau" },
      { id: "lockB", type: "key", x: 625, y: 310, w: 200, h: 70, label: "Khóa tài khoản 2", sub: "B đang giữ" },
      { id: "order", type: "check", x: 340, y: 195, w: 200, h: 70, label: "Thứ tự khóa", sub: "luôn số nhỏ trước" }
    ],
    edges: [
      { id: "t1-lockA", from: "t1", to: "lockA", kind: "request", label: "giữ khóa 1", bow: 22 },
      { id: "lockA-t1", from: "lockA", to: "t1", kind: "response", label: "nhả khóa", bow: -22 },
      { id: "t2-lockB", from: "t2", to: "lockB", kind: "request", label: "giữ khóa 2" },
      { id: "t1-lockB", from: "t1", to: "lockB", kind: "request", label: "chờ khóa 2" },
      { id: "t2-lockA", from: "t2", to: "lockA", kind: "request", label: "chờ khóa 1" },
      { id: "wait-order", from: "wait", to: "order", kind: "control", label: "phá vòng chờ" },
      { id: "order-watch", from: "order", to: "watch", kind: "control", label: "hạn 500 ms" }
    ],
    learn: [
      "Bế tắc cần hội đủ <strong>bốn điều kiện Coffman</strong>; phá một điều kiện là đủ.",
      "Hai luồng khóa hai tài khoản ngược thứ tự tạo chu trình chờ.",
      "Áp thứ tự khóa toàn cục theo id tăng dần để không thể tạo vòng.",
      "<code>tryLock</code> có hạn và bộ phát hiện chu trình là lưới an toàn."
    ],
    steps: [
      {
        short: "Bốn điều kiện",
        type: "concept",
        title: "Bốn điều kiện Coffman",
        body: "Bế tắc chỉ xảy ra khi hội đủ bốn điều kiện Coffman: loại trừ tương hỗ, giữ và chờ, không tước đoạt, và chờ vòng tròn. Loại trừ tương hỗ nghĩa là mỗi khóa chỉ một luồng giữ tại một thời điểm. Giữ và chờ nghĩa là luồng đang giữ khóa này vẫn xin khóa khác. Không tước đoạt nghĩa là hệ không tự lấy lại khóa. Chờ vòng tròn nghĩa là tồn tại chuỗi luồng chờ nhau khép kín. Phá chỉ cần một điều kiện là đủ. Thực tế người ta thường phá điều kiện thứ tư bằng cách áp thứ tự khóa, hoặc phá điều kiện thứ hai bằng cách xin tất cả khóa cùng lúc. Hãy ghi bốn điều kiện này lên bảng khi thiết kế.",
        focus: ["t1", "t2", "wait"],
        edges: ["t1-lockA", "t2-lockA"],
        metrics: { threads: "2", locks: "2", cycles: "1", ok: "bế tắc" },
        changes: [
          { label: "Cách chẩn đoán", before: "đoán theo triệu chứng treo", after: "đối chiếu bốn điều kiện Coffman" },
          { label: "Hướng sửa", before: "khởi động lại dịch vụ", after: "phá một trong bốn điều kiện" }
        ],
        note: "Thiếu một điều kiện thì bế tắc không thể xảy ra, dù tải cao."
      },
      {
        short: "Khóa ngược chiều",
        type: "flow",
        title: "Hai luồng khóa ngược chiều",
        body: "Luồng A chuyển tiền từ tài khoản 1 sang 2: khóa tài khoản 1, rồi xin khóa tài khoản 2. Luồng B chuyển ngược lại: khóa tài khoản 2, rồi xin khóa tài khoản 1. Nếu hai luồng chạy đúng thời điểm, A giữ 1 và chờ 2, B giữ 2 và chờ 1, tạo chu trình khép kín. Cả hai chờ mãi, không luồng nào nhả khóa, và hệ thống treo cho tới khi có người khởi động lại. Đây là bế tắc kinh điển, không phải lỗi hiếm: tải càng cao, xác suất chen vào đúng khe càng lớn. Thử nghiệm với 8 luồng và 4 khóa thường tái hiện trong vài giây. Điều đáng chú ý là mã của từng luồng đều đúng khi xét riêng.",
        focus: ["t1", "t2", "lockA", "lockB", "wait"],
        edges: ["t1-lockA", "t2-lockB", "t1-lockB", "t2-lockA"],
        metrics: { threads: "2", locks: "2", cycles: "1", ok: "treo" },
        changes: [
          { label: "Trạng thái", before: "hai giao dịch chạy song song", after: "cả hai dừng, giữ khóa" },
          { label: "Thời gian chờ", before: "vài mili giây", after: "vô hạn cho tới khi khởi động lại" }
        ],
        note: "Mỗi luồng đúng khi xét riêng; lỗi chỉ xuất hiện khi ghép lại."
      },
      {
        short: "Thứ tự cố định",
        type: "detail",
        title: "Áp thứ tự khóa cố định",
        body: "Biện pháp rẻ nhất là đặt thứ tự toàn cục cho mọi khóa, ví dụ theo số tài khoản nhỏ trước, và yêu cầu mọi luồng xin theo đúng thứ tự đó. Luồng B cũng phải khóa tài khoản 1 trước dù nó chuyển tiền theo chiều ngược. Khi mọi luồng đi cùng một hướng trên đồ thị khóa, chu trình không thể hình thành, nên điều kiện chờ vòng tròn bị phá. Cách này không tốn thêm bộ nhớ. Hạn chế là phải rà soát toàn bộ mã để không còn chỗ nào xin khóa ngược. Hãy gói việc xin khóa vào một hàm duy nhất có sắp xếp id, và cấm gọi khóa trực tiếp ở nơi khác. Ghi quy tắc vào tài liệu.",
        focus: ["order", "lockA", "lockB"],
        edges: ["wait-order", "t1-lockA", "t1-lockB"],
        metrics: { threads: "2", locks: "2", cycles: "0", ok: "thoát" },
        changes: [
          { label: "Thứ tự xin khóa", before: "theo chiều giao dịch", after: "theo id tài khoản tăng dần" },
          { label: "Chu trình chờ", before: "1 chu trình", after: "0, không thể hình thành" }
        ],
        note: "Một hàm xin khóa duy nhất giúp quy tắc không bị phá ở chỗ khác."
      },
      {
        short: "Chờ vô hạn",
        type: "pitfall",
        title: "Chờ mãi và giữ khóa",
        body: "Thứ tự khóa đúng vẫn có thể treo nếu một luồng giữ khóa rồi gọi dịch vụ mạng chậm, hoặc chờ một luồng khác đang chờ chính nó. Vì vậy cần thêm chờ có thời hạn: <code>tryLock</code> với hạn 500 ms, hết hạn thì nhả hết khóa đang giữ, ghi log và thử lại theo thứ tự. Cách này phá điều kiện không tước đoạt một cách mềm. Cũng nên đặt hạn cho toàn bộ giao dịch, tránh giữ khóa qua lời gọi mạng. Với 8 luồng và 4 khóa, một vòng chờ hiếm vẫn có thể xuất hiện; bộ phát hiện chu trình định kỳ giúp phát hiện sớm. Đừng bỏ qua cảnh báo chờ lâu trong log.",
        focus: ["watch", "t1", "lockA"],
        edges: ["order-watch", "lockA-t1"],
        metrics: { threads: "8", locks: "4", cycles: "2", ok: "nguy hiểm" },
        changes: [
          { label: "Thời hạn khóa", before: "không có, chờ vô hạn", after: "500 ms rồi nhả và thử lại" },
          { label: "Giữ khóa qua mạng", before: "có", after: "cấm, đặt hạn giao dịch" }
        ],
        note: "Giữ khóa trong lúc gọi mạng là cách nhanh nhất để biến chậm thành treo."
      },
      {
        short: "Phòng bế tắc",
        type: "final",
        title: "Bốn lớp phòng bế tắc",
        tone: "final",
        body: "Chốt lại bốn lớp phòng thủ. Một: áp thứ tự khóa toàn cục, xin theo id tăng dần, gói trong một hàm duy nhất. Hai: đặt thời hạn cho mọi lần xin khóa, hết hạn thì nhả hết và thử lại. Ba: không giữ khóa qua lời gọi mạng hay thao tác đĩa chậm. Bốn: chạy bộ phát hiện chu trình định kỳ và ghi log chuỗi chờ. Khi có sự cố, lấy ảnh chụp ngăn xếp của tất cả luồng để thấy vòng chờ thật. Kiểm thử bằng cách chạy 8 luồng, 4 tài khoản, chuyển tiền ngược chiều trong nhiều phút. Nếu không thấy treo, tăng tải và thử lại. Ghi lại thứ tự khóa trong tài liệu kiến trúc.",
        focus: "all",
        edges: "all",
        metrics: { threads: "8", locks: "4", cycles: "0", ok: "an toàn" },
        changes: [
          { label: "Chính sách khóa", before: "mỗi hàm tự quyết thứ tự", after: "một thứ tự chung, một hàm xin khóa" },
          { label: "Kiểm thử", before: "chạy tay vài giao dịch", after: "8 luồng ngược chiều trong nhiều phút" }
        ],
        note: "Ảnh chụp ngăn xếp khi treo là bằng chứng rẻ nhất cho vòng chờ."
      }
    ]
  };

  P.lessons["profiling"] = {
    id: "profiling",
    module: "hieu-nang-va-an-toan",
    title: "Đo hiệu năng",
    shortTitle: "Đo hiệu năng",
    subtitle: "Thời gian tường, CPU và điểm nóng",
    blurb: "Thời gian tường và thời gian CPU kể hai câu chuyện khác nhau. Bài này đọc profiler lấy mẫu, tìm điểm nóng chiếm 62% thời gian, đếm chuyển ngữ cảnh, và đặt checklist đo trước sau để so sánh công bằng.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["profiler", "thời gian tường", "điểm nóng", "chuyển ngữ cảnh", "đo"],
    metrics: [
      { key: "wallMs", label: "Thời gian tường", tone: "blue" },
      { key: "cpuMs", label: "Thời gian CPU", tone: "yellow" },
      { key: "hotPct", label: "Điểm nóng", tone: "coral" },
      { key: "ok", label: "Kết luận", tone: "mint" }
    ],
    nodes: [
      { id: "run", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Chạy chương trình", sub: "bấm đo một lần" },
      { id: "wall", type: "clock", x: 340, y: 80, w: 200, h: 70, label: "Thời gian tường", sub: "12.400 ms" },
      { id: "cpu", type: "bolt", x: 625, y: 80, w: 200, h: 70, label: "Thời gian CPU", sub: "46.000 ms tổng" },
      { id: "sample", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "Lấy mẫu 1 ms", sub: "ghi ngăn xếp gọi" },
      { id: "ctx", type: "signal", x: 340, y: 310, w: 200, h: 70, label: "Chuyển ngữ cảnh", sub: "18.400 lần" },
      { id: "hot", type: "alert", x: 625, y: 310, w: 200, h: 70, label: "Điểm nóng 62%", sub: "hàm sắp xếp" },
      { id: "flame", type: "layers", x: 340, y: 195, w: 200, h: 70, label: "Biểu đồ ngọn lửa", sub: "cột nào cao nhất" }
    ],
    edges: [
      { id: "run-wall", from: "run", to: "wall", kind: "request", label: "đo một lần" },
      { id: "wall-cpu", from: "wall", to: "cpu", kind: "data", label: "so hai đồng hồ" },
      { id: "run-sample", from: "run", to: "sample", kind: "control", label: "bật profiler" },
      { id: "sample-hot", from: "sample", to: "hot", kind: "data", label: "mẫu dồn về" },
      { id: "hot-flame", from: "hot", to: "flame", kind: "data", label: "cột cao nhất" },
      { id: "cpu-ctx", from: "cpu", to: "ctx", kind: "data", label: "đếm chuyển" },
      { id: "flame-ctx", from: "flame", to: "ctx", kind: "control", label: "đọc chung" }
    ],
    learn: [
      "Thời gian tường là thứ người dùng thấy; CPU là tổng thời gian các luồng chạy.",
      "12.400 ms tường với 46.000 ms CPU nghĩa là gần 4 lõi bận.",
      "Profiler lấy mẫu 1 ms cho thấy <strong>62%</strong> nằm ở một hàm.",
      "Tối ưu theo tỉ lệ phần trăm, không theo cảm giác hàm nào chậm."
    ],
    steps: [
      {
        short: "Hai đồng hồ",
        type: "concept",
        title: "Hai đồng hồ, hai câu chuyện",
        body: "Một chương trình chạy 12.400 ms trên đồng hồ treo tường nhưng tiêu 46.000 ms CPU, nghĩa là trung bình gần bốn lõi làm việc cùng lúc. Thời gian tường là thứ người dùng cảm nhận, còn thời gian CPU là tổng thời gian các luồng thực sự chạy. Nếu thời gian tường giảm mà CPU tăng, bạn đang đổi điện năng lấy tốc độ. Nếu CPU thấp hơn nhiều so với tường nhân số luồng, có thể các luồng đang chờ khóa, chờ mạng hoặc chờ đĩa. Hai con số này phải đọc cùng nhau, cùng với số lõi thực tế. Đo một mình thời gian tường dễ dẫn tới kết luận sai về hiệu quả.",
        focus: ["run", "wall", "cpu"],
        edges: ["run-wall", "wall-cpu"],
        metrics: { wallMs: "12.400", cpuMs: "46.000", hotPct: "chưa rõ", ok: "gần 4 lõi bận" },
        changes: [
          { label: "Cách đo", before: "chỉ bấm đồng hồ bấm giây", after: "ghi cả thời gian tường và CPU" },
          { label: "Cách hiểu", before: "chậm là do máy yếu", after: "chậm có thể do chờ, không do tính" }
        ],
        note: "Tỉ lệ CPU trên tường xấp xỉ số lõi đang thực sự bận."
      },
      {
        short: "Lấy mẫu 1 ms",
        type: "flow",
        title: "Lấy mẫu mỗi mili giây",
        body: "Profiler lấy mẫu không can thiệp nhiều: cứ mỗi mili giây nó ghi lại ngăn xếp gọi của các luồng đang chạy. Với 12.400 ms, ta có khoảng 12.400 mẫu, đủ để thấy hàm nào xuất hiện nhiều. Các mẫu dồn vào một hàm nghĩa là hàm đó chiếm nhiều thời gian; biểu đồ ngọn lửa xếp các khung theo độ sâu gọi, khung càng rộng càng tốn thời gian. Cách đọc là tìm cột rộng nhất trước, rồi đi xuống xem hàm con nào đóng góp. Đừng tối ưu hàm nhỏ chỉ vì nó xuất hiện nhiều lần; hãy nhìn tỉ lệ phần trăm. Chạy lại sau mỗi thay đổi và so sánh trên cùng cấu hình.",
        focus: ["run", "sample", "hot", "flame"],
        edges: ["run-sample", "sample-hot", "hot-flame"],
        metrics: { wallMs: "12.400", cpuMs: "46.000", hotPct: "62%", ok: "đã có mẫu" },
        changes: [
          { label: "Dữ liệu", before: "không có ngăn xếp", after: "12.400 mẫu, mỗi mẫu 1 ms" },
          { label: "Cách đọc", before: "đoán theo tên hàm", after: "tìm cột rộng nhất trên biểu đồ" }
        ],
        note: "Mẫu là ảnh chụp rời rạc; sai số nhỏ nhưng đủ để xếp hạng điểm nóng."
      },
      {
        short: "Điểm nóng 62%",
        type: "detail",
        title: "Điểm nóng chiếm 62%",
        body: "Trong ví dụ này, hàm sắp xếp chiếm 62% số mẫu, tức khoảng 7.700 ms trên 12.400 ms. Đó là điểm nóng đáng xử lý trước mọi thứ khác. Nếu thay sắp xếp so sánh bằng sắp xếp đếm hoặc giảm số phần tử cần sắp, thời gian có thể giảm hàng nghìn mili giây, trong khi tối ưu hàm chiếm 2% chỉ tiết kiệm vài trăm mili giây. Quy tắc là tối ưu theo tỉ lệ, không theo cảm giác. Sau khi sửa, đo lại để xác nhận điểm nóng đã nhỏ và tìm điểm nóng mới. Cũng cần kiểm tra xem 62% đó có nằm trong vùng bị khóa hay không, vì như vậy vấn đề là tranh chấp chứ không phải thuật toán.",
        focus: ["hot", "flame", "cpu"],
        edges: ["hot-flame", "wall-cpu"],
        metrics: { wallMs: "12.400", cpuMs: "46.000", hotPct: "62%", ok: "biết chỗ sửa" },
        changes: [
          { label: "Thời gian trong sắp xếp", before: "7.700 ms", after: "mục tiêu dưới 3.000 ms" },
          { label: "Thứ tự ưu tiên", before: "sửa nhiều hàm nhỏ", after: "sửa một điểm nóng lớn" }
        ],
        note: "Một điểm nóng 62% đáng giá hơn mười chỗ 2% cộng lại."
      },
      {
        short: "Ba cái bẫy",
        type: "pitfall",
        title: "Đo trong điều kiện xấu",
        body: "Ba cái bẫy thường gặp. Thứ nhất, đo ngay sau khi khởi động, khi bộ đệm còn lạnh và trình thông dịch chưa tối ưu, nên kết quả chậm giả tạo; hãy chạy làm nóng trước. Thứ hai, bật profiler ở chế độ ghi mọi sự kiện làm chương trình chậm gấp nhiều lần, và chính profiler thành điểm nóng. Thứ ba, bỏ qua 18.400 lần chuyển ngữ cảnh, dấu hiệu số luồng nhiều hơn số lõi hoặc có chờ khóa. Hãy đo trên máy đích, tắt các tiến trình nền, và ghi lại cấu hình. Một phép đo tốt lặp lại được ba lần với độ lệch nhỏ.",
        focus: ["ctx", "cpu", "wall"],
        edges: ["cpu-ctx", "flame-ctx"],
        metrics: { wallMs: "12.400", cpuMs: "46.000", hotPct: "62%", ok: "số liệu nhiễu" },
        changes: [
          { label: "Điều kiện đo", before: "ngay sau khởi động", after: "làm nóng rồi đo ba lần" },
          { label: "Chuyển ngữ cảnh", before: "không để ý", after: "18.400 lần được ghi và giải thích" }
        ],
        note: "Profiler ghi quá chi tiết sẽ tự tạo ra điểm nóng giả."
      },
      {
        short: "Checklist đo",
        type: "final",
        title: "Checklist đo trước và sau",
        tone: "final",
        body: "Chốt lại quy trình đo. Trước khi sửa: ghi cấu hình máy, số lõi, phiên bản mã; chạy làm nóng; đo ba lần và lấy trung vị thời gian tường cùng thời gian CPU; lưu profiler và số chuyển ngữ cảnh. Trong khi sửa: chỉ đổi một thứ mỗi lần, ghi lại giả thuyết. Sau khi sửa: đo lại đúng quy trình cũ, so sánh cả hai đồng hồ, và kiểm tra điểm nóng mới. Đặt ngưỡng chấp nhận trước khi đo để không tự thuyết phục mình. Với ví dụ 12.400 ms, mục tiêu có thể là dưới 8.000 ms. Lưu báo cáo cạnh mã để lần sau không đo lại từ đầu.",
        focus: "all",
        edges: "all",
        metrics: { wallMs: "12.400", cpuMs: "46.000", hotPct: "62%", ok: "mục tiêu 8.000" },
        changes: [
          { label: "Quy trình", before: "đo một lần rồi sửa", after: "đo ba lần, lưu báo cáo, đo lại sau" },
          { label: "Ngưỡng", before: "không đặt trước", after: "dưới 8.000 ms mới đạt" }
        ],
        note: "Trung vị của ba lần đo ổn định hơn một lần đo may mắn."
      }
    ]
  };

  P.practice.push({
    id: "pr-speedup-threads",
    module: "hieu-nang-va-an-toan",
    tag: "SPEEDUP",
    tags: ["SPEEDUP", "Amdahl", "luồng", "phần tuần tự"],
    title: "Tăng từ 8 lên 32 luồng mà chỉ nhanh 10%",
    scenario: "Nhóm của bạn chạy một job phân tích log trên máy 32 lõi. Ở cấu hình 8 luồng, job mất 40 giây; tăng lên 32 luồng, thời gian chỉ còn 36 giây, tức nhanh hơn khoảng 10%. Cả nhóm tưởng máy chủ bị giới hạn I/O, nhưng profiler cho thấy 30% thời gian nằm trong bước đọc và chuẩn hóa dữ liệu chạy một luồng, phần còn lại đã chia đều. Sếp yêu cầu nhanh gấp đôi trong hai tuần và không có ngân sách mua máy mới. Bạn giải thích nguyên nhân và chọn hướng xử lý nào trước?",
    metrics: [
      { label: "Số luồng", value: "8 lên 32" },
      { label: "Phần tuần tự", value: "30%", danger: true },
      { label: "Tăng tốc thêm", value: "1,1 lần" }
    ],
    options: [
      "Tăng tiếp lên 64 luồng vì máy còn dư lõi",
      "Song song hóa hoặc giảm 30% phần đọc và chuẩn hóa dữ liệu",
      "Chuyển sang ngôn ngữ khác được cho là nhanh hơn",
      "Giảm kích thước log bằng cách bỏ bớt trường không dùng"
    ],
    correct: 1,
    explain: "Định luật Amdahl cho biết với 30% tuần tự, trần tăng tốc khoảng 3,3 lần, và ở 32 luồng phần song song đã bão hòa nên thêm luồng không còn tác dụng. Từ 8 lên 32 luồng chỉ nhanh thêm 10% là đúng dự đoán, không phải máy yếu. Tăng 64 luồng tệ hơn vì chi phí phối hợp tăng. Đổi ngôn ngữ không giải quyết phần tuần tự. Bỏ bớt trường log làm mất dữ liệu cần phân tích. Cách đúng là song song hóa bước đọc, chia tệp theo khối, hoặc giảm khối lượng chuẩn hóa. Đưa phần tuần tự từ 30% xuống 10% nâng trần lên 10 lần, đủ đạt mục tiêu."
  });

  P.practice.push({
    id: "pr-deadlock-order",
    module: "hieu-nang-va-an-toan",
    tag: "DEADLOCK",
    tags: ["DEADLOCK", "thứ tự khóa", "Coffman", "giao dịch"],
    title: "Hai luồng khóa tài khoản ngược thứ tự",
    scenario: "Một dịch vụ ví điện tử xử lý chuyển tiền giữa hai tài khoản. Mỗi giao dịch khóa tài khoản nguồn rồi tài khoản đích, nhả khóa sau khi ghi sổ. Vào giờ cao điểm, khoảng 20 giao dịch mỗi giây, dịch vụ treo vài lần mỗi tuần; ảnh chụp ngăn xếp cho thấy luồng chuyển A sang B đang chờ khóa B, còn luồng chuyển B sang A đang chờ khóa A. Khởi động lại thì hết treo nhưng mất giao dịch đang xử lý. Nhóm phải sửa trong tuần này và không được làm chậm giao dịch quá 50 ms. Bạn chọn cách nào?",
    metrics: [
      { label: "Giao dịch", value: "20 mỗi giây" },
      { label: "Luồng treo", value: "2", danger: true },
      { label: "Độ trễ cho phép", value: "50 ms" }
    ],
    options: [
      "Tăng số luồng để các giao dịch không phải chờ nhau",
      "Dùng một khóa toàn cục cho cả ví, mỗi lúc một giao dịch",
      "Áp thứ tự khóa cố định theo số tài khoản, kèm chờ có thời hạn",
      "Bỏ khóa và kiểm tra số dư sau khi ghi sổ"
    ],
    correct: 2,
    explain: "Vòng chờ hình thành vì hai luồng xin cùng hai khóa theo thứ tự ngược nhau, hội đủ bốn điều kiện Coffman. Thêm luồng chỉ làm vòng chờ dễ xảy ra hơn. Khóa toàn cục phá được bế tắc nhưng biến 20 giao dịch mỗi giây thành hàng đợi tuần tự, vi phạm yêu cầu độ trễ. Bỏ khóa gây ghi đè, tệ hơn treo. Cách đúng là sắp xếp hai id tài khoản rồi khóa theo thứ tự tăng dần, nên không thể tạo chu trình. Thêm <code>tryLock</code> 500 ms để thoát khi có sự cố, nhả khóa rồi thử lại. Chi phí gần như bằng không, độ trễ chỉ thêm vài mili giây."
  });

  P.cheatsheets.push({
    id: "perf",
    num: "03",
    module: "hieu-nang-va-an-toan",
    title: "Bảng tra hiệu năng",
    intro: "Trang tra nhanh cho module hiệu năng và an toàn: công thức Amdahl kèm bảng số, ngưỡng băng thông theo số lõi, bốn điều kiện bế tắc và cách phá, mẫu đọc profiler, cùng checklist đo trước và sau khi tối ưu.",
    cards: [
      {
        title: "Công thức Amdahl",
        wide: true,
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>T(n) = 1 / (s + (1 - s) / n)\ns: ti le tuan tu, n: so luong\ntran = 1 / s</code></pre></div><table class=\"cheat-table\"><thead><tr><th>Tuần tự</th><th>8 luồng</th><th>16 luồng</th><th>32 luồng</th><th>Trần</th></tr></thead><tbody><tr><td class=\"mono\">20%</td><td>3,3 lần</td><td>4,0 lần</td><td>4,4 lần</td><td>5,0 lần</td></tr><tr><td class=\"mono\">30%</td><td>2,6 lần</td><td>2,9 lần</td><td>3,1 lần</td><td>3,3 lần</td></tr><tr><td class=\"mono\">50%</td><td>1,8 lần</td><td>1,9 lần</td><td>1,9 lần</td><td>2,0 lần</td></tr></tbody></table><p>Thêm 10% chi phí phối hợp vào mẫu số, không cộng vào kết quả.</p>"
      },
      {
        title: "Băng thông và số lõi",
        html: "<table class=\"cheat-table\"><thead><tr><th>Lõi</th><th>Nhu cầu</th><th>Hiệu suất</th></tr></thead><tbody><tr><td class=\"mono\">8</td><td>64 GB/s</td><td>100%</td></tr><tr><td class=\"mono\">12</td><td>96 GB/s</td><td>100%</td></tr><tr><td class=\"mono\">16</td><td>128 GB/s</td><td>78,1%</td></tr><tr><td class=\"mono\">32</td><td>256 GB/s</td><td>39,1%</td></tr></tbody></table><p>Tính trên kênh 100 GB/s và 8 GB/s mỗi lõi. Số lõi hữu ích bằng băng thông chia nhu cầu mỗi lõi.</p>"
      },
      {
        title: "Bốn điều kiện Coffman",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Điều kiện</th><th>Cách phá</th><th>Ví dụ</th></tr></thead><tbody><tr><td>Loại trừ tương hỗ</td><td>Dùng cấu trúc không khóa</td><td>Bộ đếm nguyên tử</td></tr><tr><td>Giữ và chờ</td><td>Xin tất cả khóa cùng lúc</td><td>Khóa cả hai tài khoản một lượt</td></tr><tr><td>Không tước đoạt</td><td>Chờ có thời hạn rồi nhả</td><td><code>tryLock</code> 500 ms</td></tr><tr><td>Chờ vòng tròn</td><td>Áp thứ tự khóa toàn cục</td><td>Luôn khóa id nhỏ trước</td></tr></tbody></table><p>Chỉ cần phá một điều kiện là bế tắc không thể xảy ra.</p>"
      },
      {
        title: "Mẫu đọc profiler",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>perf record -g -F 999 ./job\nperf report --stdio | head -40\n/usr/bin/time -v ./job</code></pre></div><ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\"><li>Tìm cột rộng nhất trên biểu đồ ngọn lửa.</li><li>So thời gian tường với thời gian CPU.</li><li>Đọc số lần chuyển ngữ cảnh.</li><li>Chạy làm nóng trước khi đo.</li></ul>"
      },
      {
        title: "Checklist đo trước và sau",
        wide: true,
        html: "<ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\"><li>Ghi cấu hình máy, số lõi và phiên bản mã.</li><li>Chạy làm nóng, tắt tiến trình nền.</li><li>Đo ba lần, lấy trung vị thời gian tường và CPU.</li><li>Lưu profiler cùng số chuyển ngữ cảnh.</li><li>Đổi một thứ mỗi lần, ghi giả thuyết.</li><li>Đo lại đúng quy trình, tìm điểm nóng mới.</li><li>Đặt ngưỡng chấp nhận trước khi đo.</li></ul>"
      }
    ]
  });
})();
