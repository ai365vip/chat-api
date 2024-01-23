"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.renderCommandList = void 0;

const commandFuncs = [ (command, context, x, y, sx, sy, z) => context.arc(command[1] * sx + x, command[2] * sy + y, command[3] * (sx + sy) / 2, command[4], command[5], command[6], z), (command, context, x, y, sx, sy, z) => context.arcTo(command[1] * sx + x, command[2] * sy + y, command[3] * sx + x, command[4] * sy + y, command[5] * (sx + sy) / 2, z), (command, context, x, y, sx, sy, z) => context.bezierCurveTo(command[1] * sx + x, command[2] * sy + y, command[3] * sx + x, command[4] * sy + y, command[5] * sx + x, command[6] * sy + y, z), (command, context, x, y) => context.closePath(), (command, context, x, y, sx, sy) => context.ellipse(command[1] * sx + x, command[2] * sy + y, command[3] * sx, command[4] * sy, command[5], command[6], command[7], command[8]), (command, context, x, y, sx, sy, z) => context.lineTo(command[1] * sx + x, command[2] * sy + y, z), (command, context, x, y, sx, sy, z) => context.moveTo(command[1] * sx + x, command[2] * sy + y, z), (command, context, x, y, sx, sy, z) => context.quadraticCurveTo(command[1] * sx + x, command[2] * sy + y, command[3] * sx + x, command[4] * sy + y, z), (command, context, x, y, sx, sy, z) => context.rect(command[1] * sx + x, command[2] * sy + y, command[3] * sx, command[4] * sy, z) ];

function renderCommandList(commandList, context, x = 0, y = 0, sx = 1, sy = 1, z) {
    for (let i = 0; i < commandList.length; i++) {
        const command = commandList[i];
        commandFuncs[command[0]](command, context, x, y, sx, sy, z);
    }
}

exports.renderCommandList = renderCommandList;
//# sourceMappingURL=render-command-list.js.map