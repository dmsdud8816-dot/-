import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Play, RotateCcw, Plus } from "lucide-react";

const defaultItems = [
  "미소야",
  "콩심",
  "김치찌개",
  "중식당",
  "엉클조",
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function CodingRouletteApp() {
  const [itemsText, setItemsText] = useState(defaultItems.join("\n"));
  const items = useMemo(
    () => itemsText.split("\n").map((v) => v.trim()).filter(Boolean),
    [itemsText]
  );

  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("아직 결과 없음");
  const [isSpinning, setIsSpinning] = useState(false);
  const [title, setTitle] = useState("오늘 뭐 먹지? 식당 룰렛");

  const size = 360;
  const center = size / 2;
  const radius = 160;
  const segmentAngle = items.length > 0 ? 360 / items.length : 360;

  const spin = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setResult("돌리는 중...");

    const winnerIndex = Math.floor(Math.random() * items.length);
    const targetAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const pointerAngle = 0;
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    const finalRotation = rotation + extraSpins + (360 - targetAngle + pointerAngle);

    setRotation(finalRotation);

    window.setTimeout(() => {
      setResult(items[winnerIndex]);
      setIsSpinning(false);
    }, 4200);
  };

  const reset = () => {
    setRotation(0);
    setResult("아직 결과 없음");
    setIsSpinning(false);
  };

  const loadSample = () => {
    setItemsText(defaultItems.join("\n"));
    setTitle("코딩으로 밥먹는거 룰렛");
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>룰렛 제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 점심 뭐 먹지?"
              />
            </div>

            <div className="space-y-2">
              <Label>항목 목록 (한 줄에 하나씩)</Label>
              <Textarea
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                className="min-h-[240px]"
                placeholder="미소야
콩심
김치찌개"
              />
              <p className="text-sm text-slate-500">
                항목 수: {items.length}개
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={spin} disabled={isSpinning || items.length === 0} className="rounded-2xl">
                <Play className="mr-2 h-4 w-4" />
                돌리기
              </Button>
              <Button variant="outline" onClick={reset} className="rounded-2xl">
                <RotateCcw className="mr-2 h-4 w-4" />
                초기화
              </Button>
              <Button variant="outline" onClick={loadSample} className="col-span-2 rounded-2xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                샘플 항목 불러오기
              </Button>
            </div>

            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="text-sm text-slate-500">당첨 결과</div>
              <div className="mt-1 text-2xl font-bold">{result}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute -top-2 z-20 text-4xl">▼</div>
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4.2, ease: [0.2, 0.8, 0.2, 1] }}
                  className="rounded-full"
                >
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={center} cy={center} r={radius + 8} fill="#0f172a" />
                    {items.map((item, index) => {
                      const startAngle = index * segmentAngle;
                      const endAngle = (index + 1) * segmentAngle;
                      const midAngle = startAngle + segmentAngle / 2;
                      const labelPos = polarToCartesian(center, center, radius * 0.62, midAngle);

                      const fills = [
                        "#e2e8f0",
                        "#cbd5e1",
                        "#94a3b8",
                        "#f1f5f9",
                      ];

                      return (
                        <g key={`${item}-${index}`}>
                          <path
                            d={describeArc(center, center, radius, startAngle, endAngle)}
                            fill={fills[index % fills.length]}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={labelPos.x}
                            y={labelPos.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fontWeight="700"
                            fill="#0f172a"
                            transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                          >
                            {item.length > 10 ? `${item.slice(0, 10)}…` : item}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx={center} cy={center} r="26" fill="#ffffff" />
                    <text
                      x={center}
                      y={center}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      START
                    </text>
                  </svg>
                </motion.div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {items.map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {idx + 1}. {item}
                  </span>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-slate-500">
                항목을 직접 수정해서 점심 메뉴, 회의 안건, 팀 선택, 랜덤 추첨용으로도 바로 쓸 수 있음.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
