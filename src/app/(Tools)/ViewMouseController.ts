/**
 * 휠은 「페이지 넘기기」 하나만 한다.
 *
 * 예전에는 같은 휠에 확대(TransformWrapper 의 wheel)와 페이지 넘기기가 같이 걸려
 * 있어서, 한 번 굴리면 커지면서 넘어갔다. 확대는 위쪽 슬라이더가 맡는다.
 */

/** 마지막으로 페이지를 넘긴 시각. 한 번 굴린 것이 여러 장으로 번지는 걸 막는다. */
let lastMovedAt = 0;

/** 굴림 한 번으로 치는 간격(ms). 트랙패드는 한 동작에 이벤트를 수십 개 쏜다. */
const COOLDOWN = 150;

/** 이보다 작은 움직임은 손 떨림으로 보고 무시한다. */
const THRESHOLD = 4;

export const Whellmove = (
  e: React.WheelEvent,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  total: number,
  step = 1,          // 두 장 펼침이면 2
) => {
  if (total <= 1) return;

  // 세로 휠이 기본이고, 가로로만 굴리는 기기도 있어서 큰 쪽을 쓴다.
  const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (Math.abs(delta) < THRESHOLD) return;

  const now = Date.now();
  if (now - lastMovedAt < COOLDOWN) return;
  lastMovedAt = now;

  // 끝에서 멈춘다. 예전에는 마지막 장에서 첫 장으로 되감겨서,
  // 넘기다 보면 어디까지 봤는지 알 수 없었다.
  const move = delta > 0 ? step : -step;
  setPage(prev => Math.min(total - 1, Math.max(0, prev + move)));
};

export const WhellZoom = (e: React.WheelEvent) => {
  e.preventDefault();
  e.stopPropagation();
  //스케일조정
};
