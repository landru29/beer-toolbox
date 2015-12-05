/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 landru29
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/

/** 
 * @ngdoc service
 * @name BeerToolbox.Polynome
 * @module BeerToolbox
 * @description
 *  Perform basic operations on a polynome, including solve
 */
angular.module('BeerToolbox').service('Polynome', function(){
    'use strict';
    
    /**
     * @ngdoc method
     * @constructor
     * @name Polynome
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description
     * Constructor
     * @param {Object} polynomeObj Polynome; ie <pre>
     * {
     *     a0 : 1, 
     *     a1 : 5, 
     *     a2 : 6, 
     *     a3 : 9
     * }</pre>
     **/
    var Polynome = function(polynomeObj) {
        var self = this;
        this.polynomeObj = {};
        var degrees = [0];
        Object.keys(polynomeObj).forEach(function(key) {
            var matcher = key.match(/[a-zA-Z_\.\-]*(\d+)/);
            if (matcher) {
                var degree = parseInt(matcher[1], 10);
                degrees.push(degree);
                self.polynomeObj[degree] = parseFloat(polynomeObj[key]);
            }
        });
        this.size = Math.max.apply(null, degrees) + 1;
    };
    
    /**
     * @ngdoc method
     * @name solveEq
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description
     * Solve a polynome equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * @param {Object} polynomeObj Polynome; ie <pre>
     * {
     *     a0 : 1, 
     *     a1 : 5, 
     *     a2 : 6, 
     *     a3 : 9
     * }</pre>
     * @param  {Float} value       Value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * 
     * @return {Array} Set of solutions
     **/
    Polynome.prototype.solveEq = function(value) {
        switch (this.size) {
            case 1:
                return [];
            case 2:
                return firstDegree(this.polynomeObj, value);
            case 3:
                return secondDegree(this.polynomeObj, value);
            case 4:
                return thirdDegree(this.polynomeObj, value);
            default:
                return [];
        }
    };
    
    /**
     * @ngdoc method
     * @name invert
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description
     * Solve the polynome
     * @param   {Integer|float} value Value to pass to the polynome
     * @returns {Float} Solution
     */
    Polynome.prototype.invert = function(value){
        var result = this.solveEq(value);
        return result.length ? result[0] : null;
    };
    
    /**
     * @ngdoc method
     * @name direct
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description 
     * Inject th value in the polynome 
     * @param   {Integer|float} value Value to pass to the polynome
     * @returns {float} Solution
     */
    Polynome.prototype.direct = function(value) {
        var self = this;
        var result = 0;
        Object.keys(this.polynomeObj).forEach(function(degree) {
            result += self.polynomeObj[degree] * Math.pow(value, degree);
        });
        return result;
    };
    
    /**
     * Solve a first degree polynome
     * 
     * @param {Object} polynomeObj Polynome; ie {a0: 1, a1:5}
     * @param  {Float} value       Value in the equation a1.x + a0 = value
     * 
     * @return {Array}
     **/ 
    var firstDegree = function(polynomeObj, value) {
        if (polynomeObj[1]) {
            return [(value - (polynomeObj[0] ? polynomeObj[0] : 0)) / polynomeObj[1]];
        } else {
            return [];
        }
    };
    
    /**
     * Solve a second degree polynome
     * 
     * @param {Object} polynomeObj Polynome; ie {a0: 1, a1:5, a2:6}
     * @param  {Float} value       Value in the equation a2.x^2 + a1.x + a0 = value
     * 
     * @return {Array}
     **/ 
    var secondDegree = function(polynomeObj, value) {
        var delta = Math.pow(polynomeObj[1], 2) - 4 *(polynomeObj[0] - value) * polynomeObj[2];
        if (delta<0) {
            return [];
        }
        if (delta === 0) {
            return [-polynomeObj[1]/(2*polynomeObj[2])];
        }
        if (delta > 0) {
            return [
                (-polynomeObj[1] + Math.sqrt(delta)) / (2 * polynomeObj[2]),
                (-polynomeObj[1] - Math.sqrt(delta)) / (2 * polynomeObj[2])
            ];
        }
    };

    /**
     * Solve a third degree polynome
     * 
     * @param {Object} polynomeObj Polynome; ie {a0: 1, a1:5, a2:6, a3:9}
     * @param  {Float} value       Value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * 
     * @return {Array}
     **/ 
    var thirdDegree = function(polynomeObj, value) {
        if (polynomeObj[3] !== 0) {
            if ((polynomeObj[1] === 0) && (polynomeObj[2] === 0)) {
                sol[0] = 1;
                return [-Math.pow((polynomeObj[0] - value) / polynomeObj[3],1/3)];
            } else {
                var a0 = (polynomeObj[0] - value) / polynomeObj[3];
                var a1 = polynomeObj[1] / polynomeObj[3];
                var a2 = polynomeObj[2] / polynomeObj[3];
                var a3 = a2 / 3;
                var p = a1 - a3 * a2;
                var q = a0 - a1 * a3 + 2 * Math.pow(a3, 3);
                var delta = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
                if (delta > 0) {
                    var w= Math.pow(-q / 2 + Math.sqrt(delta),1/3);
                    return [w - p / (3 * w) - a3];
                }
                if (delta === 0) {
                    return [
                        3 * q / p - a3,
                        -3 * q / (2 * p) - a3,
                        -3 * q / (2 * p) - a3
                    ];
                }
                if (delta < 0) {
                    var u= 2 * Math.sqrt(-p / 3);
                    var v= -q / (2 * Math.pow(-p / 3, 3 / 2));
                    var t= Math.acos(v) / 3;
                    return [
                        u * Math.cos(t) - a3,
                        u * Math.cos(t + 2 * Math.PI / 3) - a3,
                        u * Math.cos(t + 4 * Math.PI / 3) - a3
                    ];
                }
            }
        } else {
            return secondDegree(equ, value);
        }
    };
    
    return Polynome;
});