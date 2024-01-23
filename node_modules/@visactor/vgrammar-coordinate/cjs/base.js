"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Coordinate = void 0;

const vutils_1 = require("@visactor/vutils");

class Coordinate {
    constructor() {
        this.startPoint = {
            x: 0,
            y: 0
        }, this.endPoint = {
            x: 0,
            y: 0
        }, this.originPoint = {
            x: 0,
            y: 0
        }, this.width = 0, this.height = 0, this.transforms = [];
    }
    start(x, y) {
        return (0, vutils_1.isNil)(x) ? this.startPoint : (this.startPoint = this._parsePoint(x, y), 
        this._updateSize(), this);
    }
    end(x, y) {
        return (0, vutils_1.isNil)(x) ? this.endPoint : (this.endPoint = this._parsePoint(x, y), 
        this._updateSize(), this);
    }
    _parsePoint(x, y) {
        const point = {
            x: 0,
            y: 0
        };
        return (0, vutils_1.isArray)(x) ? (point.x = x[0], point.y = x[1]) : (0, vutils_1.isNumber)(x) ? (point.x = x, 
        point.y = y) : (point.x = x.x, point.y = x.y), point;
    }
    _updateSize() {
        this.width = this.endPoint.x - this.startPoint.x, this.height = this.endPoint.y - this.startPoint.y;
    }
    isTransposed() {
        return this.transforms && this.transforms.filter((transform => "transpose" === transform.type)).length % 2 != 0;
    }
    isMainDimension(dim) {
        let isMain = "x" === dim || "theta" === dim || "0" === dim;
        return this.isTransposed() && (isMain = !isMain), isMain;
    }
    applyTransforms(transforms) {
        return this.transforms = transforms.slice(), this._invokeTransforms(), this;
    }
    _invokeTransforms() {
        this.invertMatrix = null, this.convertMatrix = null, this.invertMatrix = new vutils_1.Matrix, 
        this.invertMatrix.translate(this.originPoint.x, this.originPoint.y), this.transforms.forEach((transform => {
            switch (transform.type) {
              case "translate":
                this.invertMatrix.translate(transform.offset.x, transform.offset.y);
                break;

              case "rotate":
                this.invertMatrix.rotateByCenter(transform.angle, this.originPoint.x, this.originPoint.y);
                break;

              case "scale":
                this.invertMatrix.scale(transform.scale.x, transform.scale.y);
                break;

              case "transpose":
                "polar" !== this.type && this.invertMatrix.transpose();
            }
        })), this.invertMatrix, this.convertMatrix = this.invertMatrix.getInverse();
    }
}

exports.Coordinate = Coordinate;