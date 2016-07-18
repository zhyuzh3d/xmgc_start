/*我的任务页面控制器
 */

(function() {
    var ctrlrname = 'pageTasks';
    angular.module('app').controller(ctrlrname, ['$rootScope', '$scope', '$element', fn]);

    function fn($rootScope, $scope, $element) {
        $rootScope[ctrlrname] = $scope;
        $scope.ctrlrName = ctrlrname;
        _fns.getCtrlrAgs($scope, $element);

        //载入外部依赖
        _fns.addLib('swal');
        _fns.addLib('toastr');
        _fns.addLib('moment');
        _fns.addLib('simditor');
        _fns.addLib('jform');
        _fns.addLib('plupload');
        _fns.addLib('qiniu');

        //如果未登录自动跳到登陆
        var xdat = $rootScope.xdat;
        if (!xdat.authData) {
            $rootScope.topNavbar.changePage('pageLogin', {
                redirCtrlr: ctrlrname
            });
        };


        //任务相关操作的his
        var hisOpTypes = $scope.hisOpTypes = _cfg.hisOpTypes.task;

        //把操作历史记录到taskHiss,并同步到个人纪录uis3hiss
        $scope.addTaskHis = function(uid, taskkey, operate, args) {
            var dt = {
                uid: uid,
                targetType: 'task',
                targetKey: taskkey,
                operate: operate,
                args: args || 0,
                time: Number(new Date()),
            };
            var newobj = _wdapp.child('taskHiss').push(dt, $scope.dbCallbackED);
            var key = newobj.key();
            var dt = {};
            dt[uid] = key;
            _wdapp.child('uis3hiss').update(dt, $scope.dbCallbackED);
        };


        //添加一个任务
        $scope.addTask = function() {
            swal({
                title: "",
                text: '输入任务名称',
                type: 'input',
                showCancelButton: true,
            }, function(ipt) {
                if (ipt) {
                    var newobj = _wdapp.child('tasks').push({
                        title: ipt,
                        time: Number(new Date()),
                        endTime: Number(moment().add(1, 'days')),
                        authorId: xdat.authData.uid,
                        endDatePickerIsOpen: true,
                    });

                    //写入key属性
                    var key = newobj.key();
                    _wdapp.child('tasks/' + key).update({
                        key: key
                    });

                    //写入到author.myTaskkeys
                    var dt = {};
                    dt[key] = key;
                    _wdapp.child('users/' + xdat.authData.uid + '/authorTaskKeys').update(dt);

                    //记录历史
                    $scope.addTaskHis(xdat.authData.uid, key, hisOpTypes.add.value);
                };
            });
        };

        //任务的状态对应的图标
        $scope.taskStateFas = _cfg.taskStates;


        //获取状态图
        $scope.getStateFas = function(tsk) {
            var res;
            for (var i = 0; i < $scope.taskStateFas.length; i++) {
                var stt = $scope.taskStateFas[i];
                if (stt.value == tsk.state) res = stt;
            };
            if (!res) res = $scope.taskStateFas[0];
            return res;
        };

        //读取任务列表 author 或 member
        $scope.getTasks = function(type) {
            var uid = _xdat.authData.uid;
            var tasksdb = 'users/' + uid + '/' + type + 'TaskKeys';
            _wdapp.child(tasksdb).on("value", function(shot, err) {
                var taskKeys = shot.val();
                $scope.tasks = {};
                for (var key in taskKeys) {
                    //读取task信息
                    _wdapp.child('tasks/' + key).on('value', function(shot, err) {
                        var task = shot.val();
                        if (!task) return;

                        //数据处理
                        $scope.tasks[task.key] = task;
                        task.timeFmt = moment(task.time).format('MM/DD');
                        //                        task.time = new Date(task.time);
                        task.endTime = new Date(task.endTime);
                        task.key = task.key;

                        //读取每个作者信息
                        _wdapp.child('users/' + task.authorId).on("value", function(shot, err) {
                            task.author = shot.val();
                            _fns.applyScope($scope);
                        });

                        //读取每个成员的信息
                        task.members = {};
                        for (var subkey in task.memberIds) {
                            _wdapp.child('users/' + subkey).on("value", function(shot, err) {
                                var usr = shot.val();
                                task.members[usr.uid] = usr;
                                _fns.applyScope($scope);
                            });
                        };

                        _fns.applyScope($scope);
                    });
                };
                _fns.applyScope($scope);
            }, function(errorObject) {
                toastr.info('载入任务列表失败:' + errorObject);
            });
        };

        //初始化载入
        if (xdat.authData) {
            $scope.getTasks('author');
        };


        //删除团队
        $rootScope.delTask = function(tsk) {
            //从author.authorTaskKeys中删除
            _wdapp.child('users/' + tsk.authorId + '/authorTaskKeys/' + tsk.key).remove($scope.dbCallback);

            //从member.memberTaskKeys中删除
            for (var uid in tsk.memberIds) {
                _wdapp.child('users/' + uid + '/memberTaskKeys/' + tsk.key).remove($scope.dbCallback);
            };

            //删除team
            _wdapp.child('tasks/' + tsk.key).remove($scope.dbCallback);

            //记录操作
            $scope.addTaskHis(xdat.authData.uid, tsk.key, hisOpTypes.delete.value);
        };

        //通用数据读写后的回调(err,dat)
        $scope.dbCallbackED = function dbCallback(err, dat) {
            if (err) {
                swal('数据操作失败:' + err);
            } else {
                _fns.applyScope($scope);
            }
        };

        //通用数据读写后的回调(dat,err)
        $scope.dbCallbackDE = function dbCallback(dat, err) {
            if (err) {
                swal('数据操作失败:' + err);
            } else {
                _fns.applyScope($scope);
            }
        };

        //根据邮箱获取用户uid
        $scope.addMember = function(tsk) {
            swal({
                title: "",
                text: '输入他的邮箱',
                type: 'input',
                showCancelButton: true,
            }, function(ipt) {
                if (ipt) {
                    _wdapp.child('umail2uid/' + md5(ipt)).once('value', function(dat, err) {
                        if (err) {
                            swal('获取用户ID失败:' + err);
                        } else {
                            //把成员id写入task.memberIds
                            var uid = dat.val();
                            if (!uid) {
                                toastr.error('此用户不存在');
                            };
                            var dt = {};
                            dt[uid] = uid;
                            _wdapp.child('tasks/' + tsk.key + '/memberIds').update(dt, function(err, dat) {
                                if (err) {
                                    swal('数据操作失败:' + err);
                                } else {
                                    _fns.applyScope($scope);
                                };
                            });

                            //把teamkey写入到user.teamKeys
                            _wdapp.child('users/' + uid + '/memberTaskKeys').push({
                                key: tsk.key
                            }, $scope.dbCallbackED);

                            //记录操作
                            $scope.addTaskHis(xdat.authData.uid, tsk.key, hisOpTypes.addMember.value, uid)
                        }
                    });
                };
            });
        };

        //删除成员
        $scope.delMember = function(tsk, mbr) {
            //从task.memberIds中移除
            _wdapp.child('tasks/' + tsk.key + '/memberIds/' + mbr.uid).remove($scope.dbCallback);

            //从member.memberTaskKeys中移除
            _wdapp.child('users/' + mbr.uid + '/memberTaskKeys/' + tsk.key).remove($scope.dbCallback);

            //记录操作
            $scope.addTaskHis(xdat.authData.uid, tsk.key, hisOpTypes.deleteMember.value, mbr.uid)
        };

        //设置任务状态
        $scope.setTaskState = function(tsk, stt) {
            _wdapp.child('tasks/' + tsk.key).update({
                state: stt
            }, function(err, shot) {
                if (err) {
                    toastr.error('设置任务状态失败:' + err);
                } else {
                    //记录操作
                    $scope.addTaskHis(xdat.authData.uid, tsk.key, hisOpTypes.setState.value, stt);
                };
            });
        };


        //保存task的结束时间
        $scope.setTaskEndTime = function(tsk) {
            var tim = Number(tsk.endTime);
            _wdapp.child('tasks/' + tsk.key).update({
                endTime: tim
            }, function(err, shot) {
                _wdapp.child('tasks/' + tsk.key).update({
                    endDatePickerIsOpen: false
                });
                if (err) {
                    toastr.error('设置任务截止日期失败:' + err);
                } else {
                    //记录操作
                    $scope.addTaskHis(xdat.authData.uid, tsk.key, hisOpTypes.setEndTime.value, tim);
                };
            });
        };


        //打开时间选择器
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };
        $scope.dataFormat = 'MM/dd';
        $scope.dateInputFormats = ['M!/d!/yyyy'];

        $scope.endDatePicker = {
            opened: false,
        };

        $scope.showDatePicker = function(tsk) {
            tsk.endDatePickerIsOpen = true;
        };

        //显示跟帖页面
        $scope.showPosts = function(tsk) {
            $rootScope.topNavbar.changePage('pageTaskPosts', {
                taskKey: tsk.key
            });
        };


















        //打开文本编辑器
        $scope.openEditor = function(tsk, evt) {
            var tarjo = $(evt.target).siblings('#taskContent');

            //清理
            if (tsk.contentTa) tsk.contentTa.remove();
            if (tsk.contentEditor) tsk.contentEditor.destroy();

            //创建ta
            var tajo = tsk.contentTa = $('<textarea id="ccc" autofocus></textarea>');
            tajo.val(tsk.content);
            tarjo.after(tajo);
            tsk.editContentMod = true;

            $.get('http://www.10knet.com/api/getUploadToken', function(res) {
                console.log('>>res', res);

                //创建编辑器
                var editor = tsk.contentEditor = new Simditor({
                    textarea: tajo,
                    upload: {
                        url: 'http://upload.qiniu.com/',
                        params: {
                            'token': res.uptoken
                        },
                        connectionCount: 3,
                        leaveConfirm: 'Uploading is in progress, are you sure to leave this page?'
                    }
                });
            })


            /*
            //修改编辑器样式
            var editorjo = tarjo.parent().children('.simditor');
            editorjo.css({
                'border': 'none',
            });
            editorjo.find('.simditor-body').css({
                'min-height': '2em',
                'padding': '15px'
            });

            //修改上传本地图片按钮的功能
            var picbtn = $('<div id="uploadPicBtn" class="toolbar-item toolbar-item-image" style="cursor:pointer;display:inline-block">XX</div>');
            picbtn.css({
                'cursor': 'pointer',
                'display': 'inline-block',
            });
            //var oldpicbtn = editorjo.find('.menu-item-upload-image');
            var oldpicbtn = editorjo.find('.simditor-toolbar').children('ul');
            picbtn.appendTo(oldpicbtn);
            //oldpicbtn.after(picbtn);
            //oldpicbtn.remove();
            _fns.setUploaderBtn('', 'uploadPicBtn', {
                'FileUploaded': function(up, file, info) {
                    var domain = up.getOption('domain');
                    var res = JSON.parse(info);
                    var sourceLink = domain + res.key;
                    console.log('>>>>uploadpic', sourceLink);
                },
            });
            */

        };

        //隐藏内容编辑器
        $scope.closeContentEditor = function(tsk) {
            if (tsk.contentTa) tsk.contentTa.remove();
            if (tsk.contentEditor) tsk.contentEditor.destroy();
            tsk.editContentMod = false;
        };

        //保存内容
        $scope.saveContent = function(tsk) {
            var ctthtml = tsk.content = tsk.contentEditor.getValue();
            _wdapp.child('tasks/' + tsk.key).update({
                content: ctthtml
            }, function(err, shot) {
                if (err) {
                    toastr.error('保存内容失败:' + err);
                } else {
                    //记录操作
                    $scope.addTaskHis(xdat.authData.uid, tsk.key, hisOpTypes.editContent.value, ctthtml);
                    tsk.closeContentEditor(tsk);
                };
            });
        };


        //保存标题
        $scope.saveTitle = function(tsk) {
            _wdapp.child('tasks/' + tsk.key).update({
                title: tsk.title,
            }, function(err, shot) {
                if (err) {
                    toastr.error('保存标题失败:' + err);
                } else {
                    //记录操作
                    $scope.addTaskHis(xdat.authData.uid, tsk.key, hisOpTypes.editTitle.value, tsk.title);
                    tsk.editTitleMod = false;
                };
            });
        }


        //显示时间格式




        //---end--
    };
})();
