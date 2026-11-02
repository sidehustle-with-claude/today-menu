import Phaser from "phaser";
import { MENUS, pickIndex, stopRotation } from "./pick.js";

const COLORS = [0xe8590c, 0xf59f00, 0x2f9e44, 0x1c7ed6, 0x7048e8, 0xd6336c];
const SPIN_MS = 3000;

class RouletteScene extends Phaser.Scene {
  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2 - 40;
    const radius = Math.min(width, height) * 0.38;
    const slice = (Math.PI * 2) / MENUS.length;

    // 1) 돌림판을 그린다. 칸 0은 위쪽에서 시작해 시계 방향으로 놓는다.
    this.wheel = this.add.container(cx, cy);
    const g = this.add.graphics();
    MENUS.forEach((_, i) => {
      const start = -Math.PI / 2 + i * slice;
      g.fillStyle(COLORS[i % COLORS.length], 1);
      g.slice(0, 0, radius, start, start + slice, false);
      g.fillPath();
    });
    this.wheel.add(g);
    MENUS.forEach((menu, i) => {
      const mid = -Math.PI / 2 + (i + 0.5) * slice;
      const t = this.add
        .text(Math.cos(mid) * radius * 0.65, Math.sin(mid) * radius * 0.65, menu, {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setRotation(mid + Math.PI / 2);
      this.wheel.add(t);
    });

    // 화살표(고정): 돌림판 위쪽에서 아래를 가리킨다.
    this.add
      .triangle(cx, cy - radius - 8, 0, 0, 24, 0, 12, 28, 0x222222)
      .setOrigin(0.5);

    // 결과 문구
    this.result = this.add
      .text(cx, cy + radius + 56, "", { fontFamily: "sans-serif", fontSize: "32px", color: "#222222" })
      .setOrigin(0.5);

    // 2) START 버튼을 만든다
    this.button = this.add
      .text(cx, height - 60, "START", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#e8590c",
        padding: { x: 36, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.button.on("pointerdown", () => this.spin());
    this.spinning = false;
    this.rotationDeg = 0;
  }

  // 3) 누르면 결과 칸을 먼저 뽑고, 그 칸의 중심 각도로 tween을 돌린다.
  spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.result.setText("");
    const index = pickIndex();
    const base = Math.ceil(this.rotationDeg / 360) * 360;
    const target = base + stopRotation(index, MENUS.length, 4, (Math.random() - 0.5) * 0.8);
    console.log("[roulette] pick", index, MENUS[index]);
    this.tweens.add({
      targets: this.wheel,
      angle: target,
      duration: SPIN_MS,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.rotationDeg = target;
        this.spinning = false;
        this.result.setText(`오늘은 ${MENUS[index]}!`);
      },
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#fafaf7",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 360, height: 640 },
  scene: RouletteScene,
});
