/* ParallelLab engine — Amdahl, băng thông, chờ khóa; kết quả tất định */
window.PAR_ENGINE = (function () {
  const r1 = (n) => Math.round(n * 10) / 10;
  const fmt = (n) => Number(n).toLocaleString("vi-VN", { maximumFractionDigits: 1 });

  function speedup(v) {
    const serial = Number(v.serialPct);
    const workers = Math.max(1, Number(v.workers));
    const overhead = Number(v.overheadPct);
    const factor = serial / 100 + (1 - serial / 100) / workers + overhead / 100;
    const value = r1(1 / factor);
    const ok = value >= 2 ? 1 : 0;
    return {
      ok: !!ok,
      verdict: ok ? "Tăng tốc đạt" : "Tăng tốc thấp",
      meta: `${value} lần với ${workers} luồng`,
      statusText: `${value} lần · ${ok ? "đạt mốc 2 lần" : "dưới mốc 2 lần"}`,
      tags: ["Amdahl", `${serial}% tuần tự`, `chi phí ${overhead}%`],
      trace: [
        { step: "serial", label: "Phần tuần tự", result: serial > 40 ? "warn" : "ok", note: `${serial}% chương trình không chia được` },
        { step: "parallel", label: "Chia cho luồng", result: "ok", note: `${100 - serial}% còn lại chia cho ${workers} luồng` },
        { step: "overhead", label: "Chi phí phối hợp", result: overhead > 20 ? "warn" : "ok", note: `Cộng thêm ${overhead}% cho đồng bộ` },
        { step: "verdict", label: "Hệ số tăng tốc", result: ok ? "ok" : "fail", note: `1 ÷ ${r1(factor)} = ${value} lần` }
      ],
      payloadTitle: "Chi tiết phép tính",
      payload: {
        "phần tuần tự": `${serial}%`,
        "phần song song": `${100 - serial}%`,
        "số luồng": fmt(workers),
        "chi phí phối hợp": `${overhead}%`,
        "tổng thời gian tương đối": `${r1(factor)}`,
        "hệ số tăng tốc": `${value} lần`
      },
      metrics: [
        { label: "Hệ số tăng tốc", value: `${value} lần` },
        { label: "Số luồng", value: fmt(workers) },
        { label: "Phần tuần tự", value: `${serial}%` },
        { label: "Kết luận", value: ok ? "đạt" : "cần sửa" }
      ],
      values: { speedup: value, parallelPct: 100 - serial, overheadPct: overhead, ok }
    };
  }

  function memory(v) {
    const cores = Number(v.cores);
    const bandwidth = Number(v.bandwidthGBs);
    const perCore = Number(v.perCoreGBs);
    const demand = cores * perCore;
    const efficiency = r1(Math.min(1, bandwidth / demand) * 100);
    const ok = demand <= bandwidth ? 1 : 0;
    return {
      ok: !!ok,
      verdict: ok ? "Không nghẽn" : "Nghẽn băng thông",
      meta: `Nhu cầu ${fmt(demand)} GB/s trên ${fmt(bandwidth)} GB/s`,
      statusText: ok ? `Đủ băng thông · hiệu suất 100%` : `Chỉ đáp ứng ${efficiency}% nhu cầu`,
      tags: ["Bộ nhớ chung", `${fmt(cores)} lõi`, `hiệu suất ${efficiency}%`],
      trace: [
        { step: "demand", label: "Nhu cầu", result: "ok", note: `${cores} lõi × ${fmt(perCore)} GB/s = ${fmt(demand)} GB/s` },
        { step: "supply", label: "Băng thông chung", result: "ok", note: `Kênh nhớ cấp ${fmt(bandwidth)} GB/s` },
        { step: "compare", label: "So sánh", result: ok ? "ok" : "warn", note: ok ? "Nhu cầu nằm trong năng lực kênh nhớ" : `Thiếu ${fmt(demand - bandwidth)} GB/s` },
        { step: "verdict", label: "Hiệu suất", result: ok ? "ok" : "fail", note: `${efficiency}% nhu cầu được đáp ứng` }
      ],
      payloadTitle: "Chi tiết phép tính",
      payload: {
        "số lõi": fmt(cores),
        "nhu cầu mỗi lõi": `${fmt(perCore)} GB/s`,
        "tổng nhu cầu": `${fmt(demand)} GB/s`,
        "băng thông chung": `${fmt(bandwidth)} GB/s`,
        "hiệu suất": `${efficiency}%`
      },
      metrics: [
        { label: "Nhu cầu", value: `${fmt(demand)} GB/s` },
        { label: "Hiệu suất", value: `${efficiency}%` },
        { label: "Thiếu hụt", value: `${fmt(Math.max(0, demand - bandwidth))} GB/s` },
        { label: "Kết luận", value: ok ? "đủ" : "nghẽn" }
      ],
      values: { demandGBs: demand, efficiency, ok }
    };
  }

  function sync(v) {
    const threads = Number(v.threads);
    const lockPct = Number(v.lockPct);
    const wait = Number(v.waitMs);
    const lockedOps = Math.round(threads * lockPct);
    const waitMs = lockedOps * wait;
    const ok = waitMs <= 1000 ? 1 : 0;
    return {
      ok: !!ok,
      verdict: ok ? "Chờ trong hạn" : "Chờ quá lâu",
      meta: `${fmt(waitMs)} ms mỗi luồng`,
      statusText: ok ? `${fmt(waitMs)} ms · dưới 1 giây` : `${fmt(waitMs)} ms · vượt 1 giây`,
      tags: ["Đồng bộ", `${threads} luồng`, `khóa ${lockPct}%`],
      trace: [
        { step: "ops", label: "Thao tác phải khóa", result: "ok", note: `${threads} luồng × ${lockPct}% = ${fmt(lockedOps)} thao tác` },
        { step: "wait", label: "Chờ mỗi lần", result: "ok", note: `${fmt(wait)} ms cho một lần chờ` },
        { step: "total", label: "Tổng thời gian chờ", result: waitMs > 1000 ? "warn" : "ok", note: `${fmt(lockedOps)} × ${fmt(wait)} = ${fmt(waitMs)} ms` },
        { step: "verdict", label: "Kết luận", result: ok ? "ok" : "fail", note: ok ? "Nằm dưới mốc 1 giây" : "Vượt mốc 1 giây, cần giảm vùng khóa" }
      ],
      payloadTitle: "Chi tiết phép tính",
      payload: {
        "số luồng": fmt(threads),
        "tỉ lệ khóa": `${lockPct}%`,
        "thao tác khóa": fmt(lockedOps),
        "chờ mỗi lần": `${fmt(wait)} ms`,
        "tổng chờ": `${fmt(waitMs)} ms`
      },
      metrics: [
        { label: "Thao tác khóa", value: fmt(lockedOps) },
        { label: "Tổng chờ", value: `${fmt(waitMs)} ms` },
        { label: "Mốc so sánh", value: "1.000 ms" },
        { label: "Kết luận", value: ok ? "đạt" : "quá lâu" }
      ],
      values: { lockedOps, waitMs, ok }
    };
  }

  const runners = { speedup, memory, sync };

  function run(kind, values) {
    const fn = runners[kind];
    if (!fn) return { ok: false, verdict: "Không rõ", meta: "", statusText: "Không rõ", tags: [], trace: [], payload: {}, metrics: [], values: {} };
    return fn(values || {});
  }

  return {
    run,
    kinds: Object.keys(runners),
    labels: { speedup: "Tăng tốc", memory: "Bộ nhớ", sync: "Đồng bộ" }
  };
})();
