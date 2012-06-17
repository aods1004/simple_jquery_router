/**
* @fileOverview jQueryを用いたシンプルなルーティング機構
* 
* @author amemura <aods1004@yahoo.co.jp>
* @version 0.1 
*/
(function (window, $) {
    "use strict";
    var Route,
        Router,
        params_exp = /(\/:[a-z\-]+)/gi,
        match_exp  = /[a-z\-]+/i,
        replace_to_string = '\\/([a-z0-9]+)';

    /**
     * ルートエンティティクラス
     * @param {string} path ルートパス
     * @param {function} callback ルーティング時のコールバック
     * 
     */
    Route = function (path, callback) {
        this.callback = callback;
        this.map = [];
        this.matches = [];
        this.regexp = '';
        this.makeRegexp.call(this, path);
    };
    /**
     * 設定されたルートパスを正規表現にパースする
     * @param {string} path ルート 
     */
    Route.prototype.makeRegexp = function (path) {
        var i, 
            l, 
            matches  = path.match(params_exp),
            replaced = path.replace(params_exp, replace_to_string);
        if (matches && matches.length > 0) {
            for (i = 0, l = matches.length; i < l; i += 1) {
                this.map[i] = matches[i].match(match_exp)[0];
            }
        }
        this.regexp = new RegExp('^' + replaced + '\\/?$');
    };
    
    /**
     * 指定のパスがこのルートで処理するべきか返す。
     * @param {string} path ルート
     */
    Route.prototype.isMatch = function(path){
        var matches = path.match(this.regexp);
        if (matches && matches.length > 0) {
            this.matches = matches.slice(1);
            return true;
        } else {
            return false;
        }
    };
    /**
     *  マッチの配列と、ルータークラスリクエストパラメーターを取得する
     */
    Route.prototype.makeRequestParam = function () {
        var i, l, request = {};
        for(i = 0, l = this.matches.length; i < l; i += 1 ){
            request[this.map[i]] = this.matches[i];
        }
        return request;
    }, 
    /**
     * ルーターオブジェクト
     * 
     */
    Router = {
        /**
         *  ルートクラスの配列
         */
        routes: [],
        /**
         *  ルートを設定する
         */
        connect: function (path, callback) {
            this.routes.push(new Route(path, callback));
            return this;
        },
        /**
         *  現在のパスを返す
         */
        getPath: function () {
            return window.location.hash.slice(1);
        },
        /**
         *  設定されたルートに基づき処理を振り分ける
         */
        dispatch: function () {
            var i, 
                l, 
                matches, 
                path    = this.getPath(),
                routes  = this.routes;
            for (i = 0, l = routes.length; i < l; i += 1) {
                if (routes[i].isMatch(path)) {
                    routes[i].callback({
                        params: routes[i].makeRequestParam(),
                        current: path
                    });
                    break;
                }
            }
        }, 
        /**
         *  windowオブジェクトのhashchangeイベントにルータをセットする
         *  IE7では動作しない。
         *  
         *  @return {object} this
         */
        deploy: function () {
            $(window).bind('hashchange', $.proxy( function () { 
                this.dispatch();
            }, Router));
            return this;
        }, 
        /**
         *  パスを変更し、ルーティングを発生させる
         */
        save: function (str) {
            if (this.getPath() !== str) {
                window.location.hash = str;
            } else {
                this.dispatch();
            }
        }
    };
    $.SimpleRouter = Router;
}(window, jQuery));
