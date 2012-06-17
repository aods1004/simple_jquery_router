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
        _exp_routes_param = /(\/:[a-z\-]+)/gi,
        _exp_path_param   = /[a-z\-]+/i,
        _str_routes_replace = '\\/([a-z0-9]+)', 
        _exp_match_hash    = /#([^#]*)$/;

    /**
     * ルートエンティティクラス
     * @param {string} path ルートパス
     * @param {function} callback ルーティング時のコールバック
     * 
     */
    Route = function (path, callback) {
        
        /**
         *  @var callback ルーティング後処理を引き渡すコールバック
         */
        this.callback = callback;
        /**
         *  @var map {array} パラメーターと順番のマッピング用配列
         */
        this.map        = [];
        /**
         *  matches 
         */
        this.matches    = [];
        this.regexp     = '';
        this.makeRegexp(path);
        delete this.makeRegexp;
    };
    
    /**
     * 設定されたルートパスを正規表現にパースする
     * @param {string} path ルート 
     */
    Route.prototype.makeRegexp = function (path) {
        var i, 
            l, 
            matches  = path.match(_exp_routes_param),
            replaced = path.replace(_exp_routes_param, _str_routes_replace);
        if (matches && matches.length > 0) {
            for (i = 0, l = matches.length; i < l; i += 1) {
                this.map[i] = matches[i].match(_exp_path_param)[0];
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
        }
        return false;
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
    };
    /**
     * ルーターオブジェクト
     */
    Router = {
        
        /**
         *  @var {object} settings ルーター設定
         **/
        settings: {
            controllerClass: 'ctrl'
        }, 
        
        /**
         * 設定する
         * 
         */
        setting: function (args) {
            this.settings = $.extend(this.settings, args);
        }, 
        
        /**
         *  @var {array} routes ルートクラスの配列
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
         *  現在のパスを返す
         */
        
        currentPath : window.location.hash.slice(1), 
        
        getCurrentPath: function () {
            return this.currentPath;
        },
        setCurrentPath: function (str) {
            this.currentPath = str;
            return this;
        }, 
        
        /**
         * 文字列からハッシュ部分を取り出す
         */
        getHash: function (str) {
            return str.match(_exp_match_hash)[1] || '';
        }, 
        
        /**
         *  設定されたルートに基づき処理を振り分ける
         */
        dispatch: function () {
            var i, 
                l, 
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
         *  とIE7で動作しないのでonclickでも対応する。
         *  
         *  @return {object} this
         */
        deploy: function () {
            var self = this;
            $(window.document).on(
                'click', 'a.' + self.settings.controllerClass, 
                function () { 
                    var elm  = this;
                    window.setTimeout(function () {
                        self.save(self.getHash($(elm).prop('href')), false);
                    }, 20);
                }
            );
            $(window).on('hashchange', $.proxy(function () {
                var path = this.getPath();
                this.save(this.getPath(), false);
            }, self));
            return this;
        }, 
        /**
         *  パスを変更し、ルーティングを発生させる
         */
        save: function (str, hashchange_flg) {
            hashchange_flg = hashchange_flg || false;
            if (this.getCurrentPath() !== str) {
                if (hashchange_flg) {
                    window.location.hash = str;
                }
                this.setCurrentPath(str);
                this.dispatch();
            }
        }
    };
    $.SimpleRouter = Router;
}(window, jQuery));
