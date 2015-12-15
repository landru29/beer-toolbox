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
 * @name BeerToolbox.UnitsConversion
 * @module BeerToolbox
 * @description
 *  Units conversions
 */
angular.module('BeerToolbox').service('UnitsConversion',
    function (Polynome) {
        'use strict';

        var unitDecoder = /(([\w-]+)\.)?(.*)/;

        this.data = {
            temperature: {
                celcius: new Polynome({ // kelvin -> celcius
                    a0: -273.15,
                    a1: 1
                }),
                fahrenheit: new Polynome({ // kelvin -> fahrenheit
                    a0: -459.67,
                    a1: 9 / 5
                }),
                kelvin: new Polynome({ // kelvin -> kelvin
                    a1: 1
                })
            },
            color: {
                ebc: new Polynome({
                    a1: 1
                }),
                srm: new Polynome({
                    a1: 1 / 1.97
                }),
                lovibond: new Polynome({
                    a0: 0.561051,
                    a1: 0.374734
                }),
                mcu: {
                    direct: function (ebc) {
                        if (ebc / 1.97 >= 10) {
                            return (ebc / 1.97 - (50 / 7)) * 3.5;
                        } else {
                            return 10 - Math.sqrt(100.0 - ebc * 5.0761421);
                        }
                    },
                    invert: function (mcu) {
                        if (mcu >= 10) {
                            return 3.94 * (mcu + 25) / 7;
                        } else {
                            return (100 - Math.pow(10 - mcu, 2)) / 5.0761421;
                        }
                    }
                },
                rgb: {
                    direct: function (ebc) {
                        var toHex = function (i) {
                            var s = '00' + i.toString(16);
                            return s.substring(s.length - 2);
                        };
                        var r = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(0.975, ebc / 1.97))));
                        var g = Math.round(Math.min(255, Math.max(0, 245 * Math.pow(0.88, ebc / 1.97))));
                        var b = Math.round(Math.min(255, Math.max(0, 220 * Math.pow(0.7, ebc / 1.97))));
                        return '#' + toHex(r) + toHex(g) + toHex(b);
                    },
                    invert: function (rgb) {
                        /*var color = rgb.match(/#(.{2})(.{2})(.{2})/);
                        if (color.length === 4) {
                            var r = parseInt(color[1], 16);
                            var g = parseInt(color[1], 16);
                            var b = parseInt(color[1], 16);
                        }*/
                        return 0;
                    }
                }
            },
            sugar: {
                plato: new Polynome({ // sg -> plato
                    a3: 135.997,
                    a2: -630.272,
                    a1: 1111.14,
                    a0: -616.868
                }),
                brix: new Polynome({ // sg -> brix
                    a3: 182.4601,
                    a2: -775.6821,
                    a1: 1262.7794,
                    a0: -669.5622
                }),
                alcohol: new Polynome({ // sg -> alcohol
                    a1: 1 / 0.76,
                    a0: -1 / 0.76
                }),
                sg: new Polynome({ // sg -> sg
                    a1: 1
                }),
                gPerLiter: new Polynome({ // sg -> grams per liter
                    a3: 1824.601,
                    a2: -7756.821,
                    a1: 12627.794,
                    a0: -6695.622
                })
            },
            mass: {
                kg: new Polynome({ // kg->kg
                    a1: 1
                }),
                g: new Polynome({ // kg->g
                    a1: 1000
                }),
                t: new Polynome({ // kg->T
                    a1: 0.001
                }),
                mg: new Polynome({ // kg->mg
                    a1: 1000000
                })
            },
            volume: {
                l: new Polynome({ // L -> L
                    a1: 1
                }),
                ml: new Polynome({ // L -> ml
                    a1: 1000
                }),
                dl: new Polynome({ // L -> dl
                    a1: 10
                }),
                cl: new Polynome({ // L -> cl
                    a1: 100
                }),
                'dm3': new Polynome({ // L -> dm3
                    a1: 1
                }),
                'm3': new Polynome({ // L -> m3
                    a1: 0.001
                }),
                'cm3': new Polynome({ // L -> cm3
                    a1: 1000
                }),
                'mm3': new Polynome({ // L -> mm3
                    a1: 1000000
                }),
                'gal-us': new Polynome({ // L -> gal-us
                    a1: 0.220
                }),
                'gal-en': new Polynome({ // L -> gal-en
                    a1: 0.264
                }),
                pinte: new Polynome({ // L -> pinte
                    a1: 1.760
                }),
            }
        };

        /**
         * @ngdoc method
         * @name fromTo
         * @methodOf BeerToolbox.UnitsConversion
         * @module BeerToolbox
         * @description
         * Convert units
         *
         * @param   {Float} value   Value to convert
         * @param  {String} from    Current unit (type.unit)
         * @param  {String} to      Destination unit (type.unit)
         * @param {Object=} options Options (type, precision)
         *
         * @return {Float} Converted value
         **/
        this.fromTo = function (value, from, to, options) {
            var UnitException = function (origin, message) {
                this.origin = origin;
                this.message = message;
            };


            var decodeFrom = this.decodeType(from);
            var decodeTo =  this.decodeType(to);
            var unitTo = decodeTo.name;
            var unitFrom = decodeFrom.name;

            value = ('string' === typeof value) ? parseFloat(value) : value;

            options = angular.extend(
                {
                    type: decodeFrom.family,
                    precision: null
                },
                options
            );

            if (!this.data[options.type]) {
                throw new UnitException('from', 'Type ' + options.type + ' does not exist in the unit conversion system');
            }
            if (!this.data[options.type][unitFrom]) {
                throw new UnitException('from', 'Unit ' + unitFrom + ' does not exist for type ' + options.type + '=> from = ' + from);
            }
            if (!this.data[options.type][unitTo]) {
                throw new UnitException('to', 'Unit ' + unitTo + ' does not exist for type ' + options.type + '=> to = ' + to);
            }
            var siValue = this.data[options.type][unitFrom].invert(value);
            if ('number' !== typeof siValue) {
                throw new UnitException('from', 'Value ' + value + ' is out of bounce in unit ' + unitFrom + ', type ' + options.type);
            }
            var result = this.data[options.type][unitTo].direct(siValue);
            if ((options.precision) && ('number' === typeof result)) {
                var dec = Math.pow(10, options.precision);
                return Math.round(result * dec) / dec;
            } else {
                return result;
            }
        };

        /**
         * @ngdoc method
         * @name decodeType
         * @methodOf BeerToolbox.UnitsConversion
         * @module BeerToolbox
         * @param  {String} type  unitType (ie 'mass.g' or 'mass')
         * @description
         * Decode a unit type
         *
         * @return {Object} decoded unit {type, name}
         **/
        this.decodeType = function(type) {
          if (!type) {
            return {};
          }
          var matcher = type.match(unitDecoder);
          if (!matcher[3]) {
            return {
              family: matcher[2]
            };
          }
          if (matcher[3]) {
            return {
              type: matcher[2] + '.' + matcher[3],
              family: matcher[2],
              name: matcher[3]
            };
          }
        };

        /**
         * @ngdoc method
         * @name getPhysicalUnits
         * @methodOf BeerToolbox.UnitsConversion
         * @module BeerToolbox
         * @param  {String=} type  Optional unitType (ie 'mass.g')
         * @description
         * Get the list of available units
         *
         * @return {Array|Object} Units description array, or the found type
         **/
        this.getPhysicalUnits = function(unitType) {
          var self = this;
          var type = self.decodeType(unitType);

          if (!type.family) {
            return Object.keys(this.data).map(function(type) {
              return {
                type: type,
                units: Object.keys(self.data[type]).map(function(unit) {
                  return {
                    name: unit,
                    type: type + '.' + unit
                  };
                })
              };
            });
          }

          if (!type.name) {
            return Object.keys(self.data[type.family]).map(function(unit) {
              return {
                name: unit,
                type: type.family + '.' + unit
              };
            });
          }

          if (type.name) {
            var result;
            Object.keys(this.data).forEach(function(family) {
              Object.keys(self.data[family]).forEach(function(unit) {
                if (type.type === family + '.' + unit) {
                  result = {
                    name: unit,
                    type: family + '.' + unit
                  };
                }
              });
            });
            return result;
          }
        };

        /**
         * @ngdoc method
         * @name registerConversion
         * @methodOf BeerToolbox.UnitsConversion
         * @module BeerToolbox
         * @description
         * Register a new convertion
         * @param   {Object} polynomeCoef Polynome coeficients
         * @param   {String} unit         Unit (type.unit | unit)
         * @param  {String=} type         Unit type (if not specified in unit)
         **/
        this.registerConversion = function (polynomeCoef, unit, type) {
            var decode = unit.match(unitDecoder);
            if (decode) {
                var thisUnitTo = decode[3];
                type = !type ? decode[2] : type;
                this.prototype.data[type] = angular.extend({}, this.prototype.data[type]);
                this.prototype.data[type][thisUnit] = new Polynome(polynomeCoef);
            }
        };

    });
