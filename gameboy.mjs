/* === */
/* CPU */
/* === */

const CPU = function() {
  this.A  = 0;
  this.F  = 0;
  this.B  = 0;
  this.C  = 0;
  this.D  = 0;
  this.E  = 0;
  this.H  = 0;
  this.L  = 0;
  this.SP = 0;
  this.PC = 0x100;

  this.getAddr  = function(r1, r2) { return ((r1 << 8) | r2); }
  this.setZFlag = function() { this.F |= 8; }
  this.isZFlag  = function() { return this.F & 8 ? true : false }
  this.setNFlag = function() { this.F |= 4; }
  this.isNFlag  = function() { return this.F & 4 ? true : false }
  this.setHFlag = function() { this.F |= 2; }
  this.isHFlag  = function() { return this.F & 2 ? true : false }
  this.setCFlag = function() { this.F |= 1; }
  this.isCFlag  = function() { return this.F & 1 ? true : false }
};

CPU.prototype.resetState = function() {
  this.A  = 0;
  this.F  = 0;
  this.B  = 0;
  this.C  = 0;
  this.D  = 0;
  this.E  = 0;
  this.H  = 0;
  this.L  = 0;
  this.SP = 0;
  this.PC = 0x100;
};

CPU.prototype.nop = function () {}
/* ==== */
/* Load */
/* ==== */
CPU.prototype.ld_rr_Imm16 = function(reg1, reg2) {
  this[reg1] = Memory.getLowerHalf(this.PC);
  this[reg2] = Memory.getHigherHalf(this.PC);
}
CPU.prototype.ld_r_Imm8 = function(reg) {
  this[reg] = Memory.getImm8(cpu.PC);
}
CPU.prototype.ld_R_Imm16 = function(reg) {
  this[reg] = Memory.getImm16(cpu.PC);
}
CPU.prototype.ld_MR_R = function (dst, src) {
  Memory[dst] = this[src];
}
CPU.prototype.ld_R_MR = function (dst, src) {
  this[dst] = Memory[src];
}
CPU.prototype.ld_R_RM_Incr = function (regDst1, regDst2, regSrc) {
  const addr = this.getAddr(this[regDst1], this[regDst2]);
  Memory[addr] = this[regSrc];
  this[regDst2] = (this[regDst2] + 1) & 0xFF;
    if (this[regDst2] === 0) {
      this[regDst1] = (this[regDst1] + 1) & 0xFF;
  }
}
CPU.prototype.ld_R_RM_Decr = function (regDst1, regDst2, regSrc) {
  const addr = this.getAddr(this[regDst1], this[regDst2]);
  Memory[addr] = this[regSrc];
  this[regDst2] = (this[regDst2] - 1) & 0xFF;
  if (this[regDst2] === 0xFF) {
    this[regDst1] = (this[regDst1] - 1) & 0xFF;
  }
}
CPU.prototype.ld_RM_R_Incr = function (regDst, regSrc1, regSrc2) {
  const addr = this.getAddr(this[regSrc1], this[regSrc2]);
  this[regDst] = Memory[addr]; 
  this[regSrc2] = (this[regSrc2] + 1) & 0xFF;
    if (this[regSrc2] === 0) {
      this[regSrc1] = (this[regSrc1] + 1) & 0xFF;
  }
}
CPU.prototype.ld_RM_R_Decr = function (regDst, regSrc1, regSrc2) {
  const addr = this.getAddr(this[regSrc1], this[regSrc2]);
  this[regDst] = Memory[addr]; 
  this[regSrc2] = (this[regSrc2] - 1) & 0xFF;
  if (this[regSrc2] === 0xFF) {
    this[regSrc1] = (this[regSrc1] - 1) & 0xFF;
  }
}
CPU.prototype.ld_MR_Imm8 = function(addr) {
  Memory[addr] = Memory.getImm8(cpu.PC);
}
CPU.prototype.ld_MImm16_R = function(reg) {
  const lower         = this[reg] & 0xff;
  const higher        = this[reg] >> 8;
  const address       = Memory.getImm16(cpu.PC);
  Memory[address]     = lower;
  Memory[address + 1] = higher;
}
CPU.prototype.ld_r_r = function(dst, src) { this[dst] = this[src]; }
CPU.prototype.ld_MOffset_r = function(reg) {
  Memory[0xFF00 + Memory.getImm8(cpu.PC)] = this[reg];
}
CPU.prototype.ld_r_MOffset = function(reg) {
  this[reg] = Memory[0xFF00 + Memory.getImm8(cpu.PC)];
}
CPU.prototype.ld_rOffset_r = function(dst, src) {
  Memory[0xFF00 + this[dst]] = this[src];
}
CPU.prototype.ld_r_rOffset = function(dst, src) {
  this[dst] = Memory[0xFF00 + this[src]];
}

/* ===================== */
/* Increment & Decrement */
/* ===================== */
CPU.prototype.inc_rr = function(reg1, reg2) {
  this[reg2] = (this[reg2] + 1) & 0xFF;
    if (this[reg2] === 0) {
      this[reg1] = (this[reg1] + 1) & 0xFF;
  }
}
CPU.prototype.dec_rr = function(reg1, reg2) {
  this[reg2] = (this[reg2] - 1) & 0xFF;
    if (this[reg2] === 0xFF) {
      this[reg1] = (this[reg1] + 1) & 0xFF;
  }
}

/* ====== */
/* Memory */
/* ====== */

Uint8Array.prototype.getByteAt = function(addr) {
  return this[addr];
}

Uint8Array.prototype.setByteAt = function(addr, value) {
  this[addr] = value;
}

Uint8Array.prototype.getLowerHalf = function(baseAddr) {
  return this.getByteAt(baseAddr + 2);
}

Uint8Array.prototype.getHigherHalf = function(baseAddr) {
  return this.getByteAt(baseAddr + 1);
}

Uint8Array.prototype.getImm8 = function(baseAddr) {
  return this.getByteAt(baseAddr + 1)
}

Uint8Array.prototype.getImm16 = function(baseAddr) {
  return ((this.getLowerHalf(baseAddr) << 8) | this.getHigherHalf(baseAddr));
}

/* ==== */
/* Init */
/* ==== */

const cpu = new CPU();
const Memory = new Uint8Array(0xFFFF);

const opcode = {
  0x00: function() { cpu.nop(); cpu.PC++; },
  0x01: function(cpu) { cpu.ld_rr_Imm16('B', 'C'); cpu.PC+=3; },
  0x02: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.B, cpu.C), 'A'); cpu.PC++; },
  0x03: function(cpu) { cpu.inc_rr('B', 'C'); cpu.PC++; },
  0x04: function(cpu) {},
  0x05: function(cpu) {},
  0x06: function(cpu) { cpu.ld_r_Imm8('B'), cpu.PC+=2; },
  0x07: function(cpu) {},
  0x08: function(cpu) { cpu.ld_MImm16_R('SP'); cpu.PC += 3 },
  0x09: function(cpu) {},
  0x0a: function(cpu) { cpu.ld_R_MR('A', cpu.getAddr(cpu.B, cpu.C)); cpu.PC++; },
  0x0b: function(cpu) { cpu.dec_rr('B', 'C'); cpu.PC++; },
  0x0c: function(cpu) {},
  0x0d: function(cpu) {},
  0x0e: function(cpu) { cpu.ld_r_Imm8('C'), cpu.PC+=2; },
  0x0f: function(cpu) {},
  0x10: function(cpu) {},
  0x11: function(cpu) { cpu.ld_rr_Imm16('D', 'E'); cpu.PC+=3; },
  0x12: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.D, cpu.E), 'A'); cpu.PC++; },
  0x13: function(cpu) { cpu.inc_rr('D', 'E'); cpu.PC++; },
  0x14: function(cpu) {},
  0x15: function(cpu) {},
  0x16: function(cpu) { cpu.ld_r_Imm8('D'), cpu.PC+=2; },
  0x17: function(cpu) {},
  0x18: function(cpu) {},
  0x19: function(cpu) {},
  0x1a: function(cpu) { cpu.ld_R_MR('A', cpu.getAddr(cpu.D, cpu.E)); cpu.PC++; },
  0x1b: function(cpu) { cpu.dec_rr('B', 'C'); cpu.PC++; },
  0x1c: function(cpu) {},
  0x1d: function(cpu) {},
  0x1e: function(cpu) { cpu.ld_r_Imm8('E'), cpu.PC+=2; },
  0x1f: function(cpu) {},
  0x20: function(cpu) {},
  0x21: function(cpu) { cpu.ld_rr_Imm16('H', 'L'); cpu.PC+=3; },
  0x22: function(cpu) { cpu.ld_R_RM_Incr('H', 'L', 'A'); cpu.PC++; },
  0x23: function(cpu) { cpu.inc_rr('H', 'L'); cpu.PC++; },
  0x24: function(cpu) {},
  0x25: function(cpu) {},
  0x26: function(cpu) { cpu.ld_r_Imm8('H'), cpu.PC+=2; },
  0x27: function(cpu) {},
  0x28: function(cpu) {},
  0x29: function(cpu) {},
  0x2a: function(cpu) { cpu.ld_RM_R_Incr('A', 'H', 'L'); cpu.PC++; },
  0x2b: function(cpu) { cpu.dec_rr('B', 'C'); cpu.PC++; },
  0x2c: function(cpu) {},
  0x2d: function(cpu) {},
  0x2e: function(cpu) { cpu.ld_r_Imm8('L'), cpu.PC+=2; },
  0x2f: function(cpu) {},
  0x30: function(cpu) {},
  0x31: function(cpu) { cpu.ld_R_Imm16('SP'); cpu.PC+=3; },
  0x32: function(cpu) { cpu.ld_R_RM_Decr('H', 'L', 'A'); cpu.PC++; },
  0x33: function(cpu) { cpu.SP++, cpu.PC++; },
  0x34: function(cpu) {},
  0x35: function(cpu) {},
  0x36: function(cpu) { cpu.ld_MR_Imm8(cpu.getAddr(cpu.H, cpu.L)); cpu.PC+=2; },
  0x37: function(cpu) {},
  0x38: function(cpu) {},
  0x39: function(cpu) {},
  0x3a: function(cpu) { cpu.ld_RM_R_Decr('A', 'H', 'L'); cpu.PC++; },
  0x3b: function(cpu) { cpu.SP--; cpu.PC++; },
  0x3c: function(cpu) {},
  0x3d: function(cpu) {},
  0x3e: function(cpu) { cpu.ld_r_Imm8('A'), cpu.PC+=2; },
  0x3f: function(cpu) {},
  0x40: function(cpu) { cpu.ld_r_r('B', 'B'); cpu.PC++; },
  0x41: function(cpu) { cpu.ld_r_r('B', 'C'); cpu.PC++; },
  0x42: function(cpu) { cpu.ld_r_r('B', 'D'); cpu.PC++; },
  0x43: function(cpu) { cpu.ld_r_r('B', 'E'); cpu.PC++; },
  0x44: function(cpu) { cpu.ld_r_r('B', 'H'); cpu.PC++; },
  0x45: function(cpu) { cpu.ld_r_r('B', 'L'); cpu.PC++; },
  0x46: function(cpu) { cpu.ld_R_MR('B', cpu.getAddr(cpu.H, cpu.L)); cpu.PC++; },
  0x47: function(cpu) { cpu.ld_r_r('B', 'A'); cpu.PC++; },
  0x48: function(cpu) { cpu.ld_r_r('C', 'B'); cpu.PC++; },
  0x49: function(cpu) { cpu.ld_r_r('C', 'C'); cpu.PC++; },
  0x4a: function(cpu) { cpu.ld_r_r('C', 'D'); cpu.PC++; },
  0x4b: function(cpu) { cpu.ld_r_r('C', 'E'); cpu.PC++; },
  0x4c: function(cpu) { cpu.ld_r_r('C', 'H'); cpu.PC++; },
  0x4d: function(cpu) { cpu.ld_r_r('C', 'L'); cpu.PC++; },
  0x4e: function(cpu) { cpu.ld_R_MR('C', cpu.getAddr(cpu.H, cpu.L)); cpu.PC++; },
  0x4f: function(cpu) { cpu.ld_r_r('C', 'A'); cpu.PC++; },
  0x50: function(cpu) { cpu.ld_r_r('D', 'B'); cpu.PC++; },
  0x51: function(cpu) { cpu.ld_r_r('D', 'C'); cpu.PC++; },
  0x52: function(cpu) { cpu.ld_r_r('D', 'D'); cpu.PC++; },
  0x53: function(cpu) { cpu.ld_r_r('D', 'E'); cpu.PC++; },
  0x54: function(cpu) { cpu.ld_r_r('D', 'H'); cpu.PC++; },
  0x55: function(cpu) { cpu.ld_r_r('D', 'L'); cpu.PC++; },
  0x56: function(cpu) { cpu.ld_R_MR('D', cpu.getAddr(cpu.H, cpu.L)); cpu.PC++; },
  0x57: function(cpu) { cpu.ld_r_r('D', 'A'); cpu.PC++; },
  0x58: function(cpu) { cpu.ld_r_r('E', 'B'); cpu.PC++; },
  0x59: function(cpu) { cpu.ld_r_r('E', 'C'); cpu.PC++; },
  0x5a: function(cpu) { cpu.ld_r_r('E', 'D'); cpu.PC++; },
  0x5b: function(cpu) { cpu.ld_r_r('E', 'E'); cpu.PC++; },
  0x5c: function(cpu) { cpu.ld_r_r('E', 'H'); cpu.PC++; },
  0x5d: function(cpu) { cpu.ld_r_r('E', 'L'); cpu.PC++; },
  0x5e: function(cpu) { cpu.ld_R_MR('E', cpu.getAddr(cpu.H, cpu.L)); cpu.PC++; },
  0x5f: function(cpu) { cpu.ld_r_r('E', 'A'); cpu.PC++; },
  0x60: function(cpu) { cpu.ld_r_r('H', 'B'); cpu.PC++; },
  0x61: function(cpu) { cpu.ld_r_r('H', 'C'); cpu.PC++;},
  0x62: function(cpu) { cpu.ld_r_r('H', 'D'); cpu.PC++; },
  0x63: function(cpu) { cpu.ld_r_r('H', 'E'); cpu.PC++; },
  0x64: function(cpu) { cpu.ld_r_r('H', 'H'); cpu.PC++; },
  0x65: function(cpu) { cpu.ld_r_r('H', 'L'); cpu.PC++; },
  0x66: function(cpu) { cpu.ld_R_MR('H', cpu.getAddr(cpu.H, cpu.L)); cpu.PC++; },
  0x67: function(cpu) { cpu.ld_r_r('H', 'A'); cpu.PC++; },
  0x68: function(cpu) { cpu.ld_r_r('L', 'B'); cpu.PC++; },
  0x69: function(cpu) { cpu.ld_r_r('L', 'C'); cpu.PC++; },
  0x6a: function(cpu) { cpu.ld_r_r('L', 'D'); cpu.PC++; },
  0x6b: function(cpu) { cpu.ld_r_r('L', 'E'); cpu.PC++; },
  0x6c: function(cpu) { cpu.ld_r_r('L', 'H'); cpu.PC++; },
  0x6d: function(cpu) { cpu.ld_r_r('L', 'L'); cpu.PC++; },
  0x6e: function(cpu) { cpu.ld_R_MR('L', cpu.getAddr(cpu.H, cpu.L)); cpu.PC++; },
  0x6f: function(cpu) { cpu.ld_r_r('L', 'A'); cpu.PC++; },
  0x70: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.H, cpu.L), 'B'); cpu.PC++; },
  0x71: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.H, cpu.L), 'C'); cpu.PC++; },
  0x72: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.H, cpu.L), 'D'); cpu.PC++; },
  0x73: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.H, cpu.L), 'E'); cpu.PC++; },
  0x74: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.H, cpu.L), 'H'); cpu.PC++; },
  0x75: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.H, cpu.L), 'L'); cpu.PC++; },
  0x76: function(cpu) {},
  0x77: function(cpu) { cpu.ld_MR_R(cpu.getAddr(cpu.H, cpu.L), 'A'); cpu.PC++; },
  0x78: function(cpu) { cpu.ld_r_r('A', 'B'); cpu.PC++; },
  0x79: function(cpu) { cpu.ld_r_r('A', 'C'); cpu.PC++; },
  0x7a: function(cpu) { cpu.ld_r_r('A', 'D'); cpu.PC++; },
  0x7b: function(cpu) { cpu.ld_r_r('A', 'E'); cpu.PC++; },
  0x7c: function(cpu) { cpu.ld_r_r('A', 'H'); cpu.PC++; },
  0x7d: function(cpu) { cpu.ld_r_r('A', 'L'); cpu.PC++; },
  0x7e: function(cpu) { cpu.ld_R_MR('A', cpu.getAddr(cpu.H, cpu.L)); cpu.PC++; },
  0x7f: function(cpu) { cpu.ld_r_r('A', 'A'); cpu.PC++; },
  0x80: function(cpu) {},
  0x81: function(cpu) {},
  0x82: function(cpu) {},
  0x83: function(cpu) {},
  0x84: function(cpu) {},
  0x85: function(cpu) {},
  0x86: function(cpu) {},
  0x87: function(cpu) {},
  0x88: function(cpu) {},
  0x89: function(cpu) {},
  0x8a: function(cpu) {},
  0x8b: function(cpu) {},
  0x8c: function(cpu) {},
  0x8d: function(cpu) {},
  0x8e: function(cpu) {},
  0x8f: function(cpu) {},
  0x90: function(cpu) {},
  0x91: function(cpu) {},
  0x92: function(cpu) {},
  0x93: function(cpu) {},
  0x94: function(cpu) {},
  0x95: function(cpu) {},
  0x96: function(cpu) {},
  0x97: function(cpu) {},
  0x98: function(cpu) {},
  0x99: function(cpu) {},
  0x9a: function(cpu) {},
  0x9b: function(cpu) {},
  0x9c: function(cpu) {},
  0x9d: function(cpu) {},
  0x9e: function(cpu) {},
  0x9f: function(cpu) {},
  0xa0: function(cpu) {},
  0xa1: function(cpu) {},
  0xa2: function(cpu) {},
  0xa3: function(cpu) {},
  0xa4: function(cpu) {},
  0xa5: function(cpu) {},
  0xa6: function(cpu) {},
  0xa7: function(cpu) {},
  0xa8: function(cpu) {},
  0xa9: function(cpu) {},
  0xaa: function(cpu) {},
  0xab: function(cpu) {},
  0xac: function(cpu) {},
  0xad: function(cpu) {},
  0xae: function(cpu) {},
  0xaf: function(cpu) {},
  0xb0: function(cpu) {},
  0xb1: function(cpu) {},
  0xb2: function(cpu) {},
  0xb3: function(cpu) {},
  0xb4: function(cpu) {},
  0xb5: function(cpu) {},
  0xb6: function(cpu) {},
  0xb7: function(cpu) {},
  0xb8: function(cpu) {},
  0xb9: function(cpu) {},
  0xba: function(cpu) {},
  0xbb: function(cpu) {},
  0xbc: function(cpu) {},
  0xbd: function(cpu) {},
  0xbe: function(cpu) {},
  0xbf: function(cpu) {},
  0xc0: function(cpu) {},
  0xc1: function(cpu) {},
  0xc2: function(cpu) {},
  0xc3: function(cpu) {},
  0xc4: function(cpu) {},
  0xc5: function(cpu) {},
  0xc6: function(cpu) {},
  0xc7: function(cpu) {},
  0xc8: function(cpu) {},
  0xc9: function(cpu) {},
  0xca: function(cpu) {},
  0xcb: function(cpu) {},
  0xcc: function(cpu) {},
  0xcd: function(cpu) {},
  0xce: function(cpu) {},
  0xcf: function(cpu) {},
  0xd0: function(cpu) {},
  0xd1: function(cpu) {},
  0xd2: function(cpu) {},
  0xd3: function(cpu) {},
  0xd4: function(cpu) {},
  0xd5: function(cpu) {},
  0xd6: function(cpu) {},
  0xd7: function(cpu) {},
  0xd8: function(cpu) {},
  0xd9: function(cpu) {},
  0xda: function(cpu) {},
  0xdb: function(cpu) {},
  0xdc: function(cpu) {},
  0xdd: function(cpu) {},
  0xde: function(cpu) {},
  0xdf: function(cpu) {},
  0xe0: function(cpu) { cpu.ld_MOffset_r('A'); cpu.PC+=2; },
  0xe1: function(cpu) {},
  0xe2: function(cpu) { cpu.ld_rOffset_r('C', 'A'); cpu.PC++; },
  0xe3: function(cpu) {},
  0xe4: function(cpu) {},
  0xe5: function(cpu) {},
  0xe6: function(cpu) {},
  0xe7: function(cpu) {},
  0xe8: function(cpu) {},
  0xe9: function(cpu) {},
  0xea: function(cpu) {},
  0xeb: function(cpu) {},
  0xec: function(cpu) {},
  0xed: function(cpu) {},
  0xee: function(cpu) {},
  0xef: function(cpu) {},
  0xf0: function(cpu) { cpu.ld_r_MOffset('A'); cpu.PC+=2; },
  0xf1: function(cpu) {},
  0xf2: function(cpu) { cpu.ld_r_rOffset('A', 'C'); cpu.PC++; },
  0xf3: function(cpu) {},
  0xf4: function(cpu) {},
  0xf5: function(cpu) {},
  0xf6: function(cpu) {},
  0xf7: function(cpu) {},
  0xf8: function(cpu) {},
  0xf9: function(cpu) {},
  0xfa: function(cpu) {},
  0xfb: function(cpu) {},
  0xfc: function(cpu) {},
  0xfd: function(cpu) {},
  0xfe: function(cpu) {},
  0xff: function() {},
};


/* ==== */
/* Main */
/* ==== */

(async function () {
  const canvas = document.querySelector("canvas");
  canvas.width  *= 3;
  canvas.height *= 4;
  const ctx = canvas.getContext("2d");

  Memory.setByteAt(cpu.PC, 0x02);
  Memory.setByteAt(cpu.PC + 1, 0x34);
  Memory.setByteAt(cpu.PC + 2, 0x12);
  cpu.A = 0x39;
  cpu.B = 0x12;
  cpu.C = 0x23;

  opcode[Memory[cpu.PC]](cpu);
  console.log(Memory[0x1223].toString(16));
})();

export { CPU, Memory, opcode };