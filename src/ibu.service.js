/** 
 * @ngdoc service
 * @name BeerToolbox.Ibu
 * @module BeerToolbox
 * @description
 *  Units conversions
 */
angular.module('BeerToolbox').service('Ibu',
    function () {
        'use strict';



        var ibuComputeMethods = {
            rager: function (alphaAcidity, massGr, volumeL, gravitySg, lastingMin) {
                var ga = (gravitySg > 1.050 ? (gravitySg - 1.050) / 0.2 : 0);
                var utilization = 18.109069 + 13.862039 * Math.tanh((lastingMin - 31.322749) / 18.267743);
                return massGr * utilization * alphaAcidity * 1000 / (volumeL * (1 + ga));
            },
            /*garetz: function (alphaAcidity, massGr, volumeL, gravitySg, lastingMin) {
                var finalVolume = volumeL;
                var CF = finalVolume / volumeL;
                var BG = (CF * (gravitySg - 1)) + 1;
                var GF = 1 + (BG - 1.050) / 0.2;
            },*/
            tinseth: function (alphaAcidity, massGr, volumeL, gravitySg, lastingMin) {
                var bignessFactor = 1.65 * Math.pow(0.000125, gravitySg - 1);
                var boilTimeFactor = (1 - Math.exp(-0.04 * lastingMin)) / 4.15;
                var utilization = bignessFactor * boilTimeFactor;
                return massGr * utilization * alphaAcidity * 1000 / volumeL;
            }
        };

        /**
         * @ngdoc method
         * @name availableMethods
         * @methodOf BeerToolbox.Ibu
         * @module BeerToolbox
         * @description
         * List of methods to compute IBU
         * @returns {Array} List of methods to compute IBU
         **/
        this.availableMethods = function () {
            return Object.keys(ibuComputeMethods);
        };


        /**
         * @ngdoc method
         * @name compute
         * @methodOf BeerToolbox.Ibu
         * @module BeerToolbox
         * @description
         * Compute IBU
         * 
         * @param {String} method Computing method
         * @param  {Array} data   Beer data <pre>
         * {
         *     alphaAcidity: 4, // alpha acidity of the hop in percent
         *     type: 'pellets', // 'pellets' | 'flowers'
         *     massGr: 50,      // mass of the hop in grams
         *     volumeL: 30,     // volume of liquid in liter
         *     gravitySg: 1.05, // specific gravity of the liquid in Sg
         *     lastingMin: 60,  //time during which the hops is in the boiling liquide
         * }</pre>
         * 
         * @returns {Float} Ibu
         **/
        this.compute = function (method, data) {
            return [0].concat(data).reduce(function (total, next) {
                var correction = /^pellet/.test(next.type ? next.type : '') ? 1.1 : 1;
                return total + ibuComputeMethods[method](correction * next.alphaAcidity / 100, next.massGr, next.volumeL, next.gravitySg, next.lastingMin);
            });
        };
    });