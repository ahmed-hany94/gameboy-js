import { CPU, Memory, opcode } from './gameboy.mjs';

const Reset = "\x1b[0m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"

const cpu = new CPU();
let i = 0;

function x(x) { return `0x${x.toString(16)}`; }
function red(x) { return`${FgRed}${x}${Reset}` }
function green(x) { return`${FgGreen}${x}${Reset}` }

function test_Memory() {
    cpu.resetState();
    Memory.fill(0);

    Memory.setByteAt(cpu.PC, 0x00);
    Memory.setByteAt(cpu.PC + 1, 0x34);
    Memory.setByteAt(cpu.PC + 2, 0x12);
    
    const imm16 = Memory.getImm16(cpu.PC);
    

    if(
        imm16  !== 0x1234
    ) {
        throw new Error(red("getImm16 failed"));
    }

    console.log(`${green(`Test ${i++} passed`)}`);
    console.log("-------------");
}

function test_LD() {

    /* ================ */
    /* 0x01, 0x11, 0x21 */
    /* ================ */
    cpu.resetState();
    Memory.fill(0);

    Memory.setByteAt(cpu.PC, 0x01);
    Memory.setByteAt(cpu.PC + 1, 0x34);
    Memory.setByteAt(cpu.PC + 2, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.B  !== 0x12 ||
        cpu.C  !== 0x34 ||
        cpu.PC !== 0x103
    ) {
        throw new Error(red("0x01: LD BC, n16"));
    }

    cpu.resetState();
    Memory.fill(0);

    Memory.setByteAt(cpu.PC, 0x11);
    Memory.setByteAt(cpu.PC + 1, 0x34);
    Memory.setByteAt(cpu.PC + 2, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.D  !== 0x12 ||
        cpu.E  !== 0x34 ||
        cpu.PC !== 0x103
    ) {
        throw new Error(red("0x11: LD DE, n16"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x21);
    Memory.setByteAt(cpu.PC + 1, 0x34);
    Memory.setByteAt(cpu.PC + 2, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.H  !== 0x12 ||
        cpu.L  !== 0x34 ||
        cpu.PC !== 0x103
    ) {
        throw new Error(red("0x21: LD HL, n16"));
    }

    console.log(green("  ld_rr_Imm16 Tests passed"));

    /* ==== */
    /* 0x31 */
    /* ==== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x31);
    Memory.setByteAt(cpu.PC + 1, 0x34);
    Memory.setByteAt(cpu.PC + 2, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.SP !== 0x1234 ||
        cpu.PC !== 0x103
    ) {
        throw new Error(red("0x31: LD SP, n16"));
    }

    console.log(green("  ld_R_Imm16 Tests passed"));

    /* ========== */
    /* 0x02, 0x12 */
    /* ========== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x02);
    cpu.A = 0x29;
    cpu.B = 0x12;
    cpu.C = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1234] ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x02: LD [BC], A"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x12);
    cpu.A = 0x29;
    cpu.D = 0x12;
    cpu.E = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1234] ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x12: LD [DE], A"));
    }

    console.log(green("  ld_MR_R Tests passed"));

    /* ========== */
    /* 0x22, 0x32 */
    /* ========== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x22);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1234] ||
        cpu.H !== 0x12           ||
        cpu.L !== 0x35           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x22: LD [HL+], A"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x22);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0xff;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x12ff] ||
        cpu.H !== 0x13           ||
        cpu.L !== 0x00           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x22: LD [HL+], A"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x32);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1234] ||
        cpu.H !== 0x12           ||
        cpu.L !== 0x33           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x32: LD [HL-], A"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x32);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0x00;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1200]                 ||
        cpu.H !== 0x11                           ||
        cpu.L !== 0xff                           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x32: D [HL-], A"));
    }

    console.log(green("  ld_R_RM_Incr, ld_R_RM_Decr Tests passed"));

    /* ================ */
    /* 0x06, 0x16, 0x26 */
    /* ================ */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x06);
    Memory.setByteAt(cpu.PC + 1, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.B  !== 0x12  ||
        cpu.PC !== 0x102
    ) {
        throw new Error(red("0x06: LD B, n8"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x16);
    Memory.setByteAt(cpu.PC + 1, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.D  !== 0x12  ||
        cpu.PC !== 0x102
    ) {
        throw new Error(red("0x26: LD D, n8"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x26);
    Memory.setByteAt(cpu.PC + 1, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.H  !== 0x12  ||
        cpu.PC !== 0x102
    ) {
        throw new Error(red("0x26: LD H, n8"));
    }

    console.log(green("  ld_r_Imm8 Tests passed"));

    /* ==== */
    /* 0x36 */
    /* ==== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x36);
    Memory.setByteAt(cpu.PC + 1, 0x12);
    cpu.H = 0x12;
    cpu.L = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        Memory[0x1234] !== 0x12 ||
        cpu.PC !== 0x102
    ) {
        throw new Error(red("0x36: LD [HL], n8"));
    }

    console.log(green("  ld_MR_Imm8 Tests passed"));

    /* ==== */
    /* 0x08 */
    /* ==== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x08);
    Memory.setByteAt(cpu.PC + 1, 0x34);
    Memory.setByteAt(cpu.PC + 2, 0x12);
    cpu.SP = 0xbeef;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        Memory[0x1234] !== 0xef ||
        Memory[0x1235] !== 0xbe ||
        cpu.PC !== 0x103
    ) {
        throw new Error(red("0x08: LD [a16], SP"));
    }

    console.log(green("  ld_MImm16_R Tests passed"));

    /* ========== */
    /* 0x0A, 0x1A */
    /* ========== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x0a);
    cpu.B          = 0x12;
    cpu.C          = 0x34;
    Memory[0x1234] = 0xbe
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A  !== Memory[0x1234] ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x0a: LD A, [BC]"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x1a);
    cpu.D          = 0x12;
    cpu.E          = 0x34;
    Memory[0x1234] = 0xbe
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A  !== Memory[0x1234] ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x1a: LD A, [DE]"));
    }

    console.log(green("  ld_R_MR Tests passed"));

    /* ========== */
    /* 0x2A, 0x3A */
    /* ========== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x2a);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1234] ||
        cpu.H !== 0x12           ||
        cpu.L !== 0x35           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x2a: LD A, [HL+]"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x2a);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0xff;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x12ff]                 ||
        cpu.H !== 0x13                           ||
        cpu.L !== 0x00                           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x2a: D A, [HL+]"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x3a);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1234] ||
        cpu.H !== 0x12           ||
        cpu.L !== 0x33           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x3a: LD A, [HL-]"));
    }

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x3a);
    cpu.A = 0x29;
    cpu.H = 0x12;
    cpu.L = 0x00;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A !== Memory[0x1200]                 ||
        cpu.H !== 0x11                           ||
        cpu.L !== 0xff                           ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x3a: LD A, [HL-]"));
    }

    console.log(green("  ld_R_RM_Incr, ld_R_RM_Decr Tests passed"));

    /* ================================== */
    /* 0xE0, 0xF0, 0xE2, 0xF2, 0xEA, 0xFA */
    /* ================================== */

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0xe0);
    Memory.setByteAt(cpu.PC + 1, 0x12);
    cpu.A = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A  !== Memory[0xFF00 + 0x12] ||
        cpu.PC !== 0x102
    ) {
        throw new Error(red("0xe0: LDH [a8], A"));
    }
    console.log(green("  ld_MOffset_r Tests passed"));

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0xf0);
    Memory.setByteAt(cpu.PC + 1, 0x12);
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A  !== Memory[0xFF00 + 0x12] ||
        cpu.PC !== 0x102
    ) {
        throw new Error(red("0xf0: LDH A, [a8]"));
    }
    console.log(green("  ld_r_MOffset Tests passed"));

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0xe2);
    cpu.A = 0x12;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A  !== Memory[0xFF00 + cpu.C] ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0xe2: LD [C], A"));
    }
    console.log(green("  ld_rOffset_r Tests passed"));

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0xf2);
    cpu.C          = 0x34;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.A  !== Memory[0xFF00 + cpu.C] ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0xf2: LD A, [C]"));
    }
    console.log(green("  ld_r_rOffset Tests passed"));


    console.log(`${green(`Test ${i++} passed`)}`);
    console.log("-------------");
}

function test_INCR_DECR () {

    cpu.resetState();
    Memory.fill(0);
    
    Memory.setByteAt(cpu.PC, 0x03);
    cpu.B = 0x01;
    cpu.C = 0xff;
    
    opcode[Memory[cpu.PC]](cpu);

    if(
        cpu.B  !== 0x02 ||
        cpu.C  !== 0x00 ||
        cpu.PC !== 0x101
    ) {
        throw new Error(red("0x03: INC BC"));
    }
    console.log(green("  inc_rr Tests passed"));
    
    console.log(`${green(`Test ${i++} passed`)}`);
    console.log("-------------");
}

(function () {
    test_Memory();
    test_LD();
    test_INCR_DECR();
    
    // So I don't run the IIFE main function when I run this test file
    process.exit();
})();