/*eslint-disable*/
'use strict';

(function($) {
    function empty() {}

    $.minima = $.minima || {};
    $.minima.queryString = (function(paramsArray) {
        var params = {};

        for (var i = 0; i < paramsArray.length; ++i) {
            var param = paramsArray[i].split('=', 2);
            if (param.length !== 2) {
                continue;
            }

            params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, ' '));
        }

        return params;
    })(window.location.search.substr(1).split('&'));

    $.minima.formatElementId = function(elementId) {
        if (!elementId) {
            throw new Error('The elementId can not be empty.');
        }
        if (!elementId.startsWith('#')) {
            elementId = '#' + elementId;
        }
        if ($(elementId).length === 0) {
            throw new Error('The element ' + elementId + ' does not exist.');
        }

        return elementId;
    };

    $.minima.showModal = function(modalId) {
        modalId = $.minima.formatElementId(modalId);
        $(modalId).modal('show');
        // 关闭按钮会自动关闭对话框，此时，需要自动处理表单的验证初始化
        function resetModal(sender) {
            $('form', modalId).each(function(each, form) {
                $.minima.resetValidate($(form).attr('id'));
            });
            $(sender).off('click', resetModal);
        };

        $('button[data-dismiss="modal"]', modalId).each(function(index, closeButton) {
            $(closeButton).on('click', resetModal);
        });
    };

    $.minima.hideModal = function(modalId) {
        modalId = $.minima.formatElementId(modalId);
        $(modalId).modal('hide');

        // 调用Hide时，需要清空Form验证
        $('form', modalId).each(function(each, form) {
            $.minima.resetValidate($(form).attr('id'));
        });
    };

    $.minima.resetValidate = function(formId) {
        formId = $.minima.formatElementId(formId);
        $(formId).data('bootstrapValidator').resetForm(true);
    };

    $.minima.validate = function(formId) {
        formId = $.minima.formatElementId(formId);
        $(formId).bootstrapValidator('validate');
        return $(formId).data('bootstrapValidator').getInvalidFields().length === 0;
    };

    $.minima.message = function(message, type, onCloseCallBack) {
        new NotificationFx({
            message: '<p text-align="center">' + message + '</p>',
            layout: 'bar',
            effect: 'slidetop',
            type: (!type || type === 0) ? 'notice' : (type === 1 ? 'warning' : 'error'),
            ttl: (!type || type === 0) ? 1000 : (type === 1 ? 2000 : 1500000),
            onClose: onCloseCallBack ? onCloseCallBack : empty
        }).show();
    };

    $.minima.messageSelectOne = function() {
        $.minima.message('请选择一条数据。', 1);
    };

    $.minima.messageOnlySelectOne = function() {
        $.minima.message('只允许选择一条记录。', 1);
    };

    $.minima.messageSuccess = function() {
        $.minima.message('操作成功。');
    };

    $.minima.messageFail = function(reason) {
        $.minima.message(reason || '操作失败。', 2);
    };

    $.minima.messageException = function(response) {
        $.minima.message('出现了意料之外的异常，创建物理主机失败，请联系管理员查看日志排查问题。', 2);
    };

    $.minima.toForm = function(data, formId) {
        // TODO: 需要处理Form的其它字段，比如data没有定义，但是form有包含，那么此时，form也应该设置为空
        // 目前必须全部重新设置 
        if (!data) {
            throw new Error('The data can not be null.');
        }

        formId = $.minima.formatElementId(formId);

        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                if ($("[name=" + i + "]", formId).is("input:radio") || $("[name=" + i + "]", formId).is("input:checkbox")) {
                    $("[name=" + i + "]", formId).each(function() {
                        if ($(this).val() == data[i]) {
                            $(this)['attr']("checked", true);
                        } else {
                            $(this)['attr']("checked", false);
                        }
                    });
                } else {
                    // this is very slow on big table and form.
                    $("[name=" + i + "]", formId).val(data[i]);
                }
            }
        }
    };

    $.minima.fromForm = function(formId) {
        formId = $.minima.formatElementId(formId);

        var fields = $(formId).serializeArray();
        var data = {};
        $.each(fields, function(i, field) {
            var dataType = $('[name=' + field.name + ']', formId).attr('data-type');
            if (!dataType) {
                data[field.name] = field.value;
            } else if (dataType === 'int') {
                data[field.name] = parseInt(field.value);
            } else if (dataType === 'float') {
                data[field.name] = parseFloat(field.value);
            } else if (dataType === 'date') {
                data[field.name] = Date.parse(field.value);
            } else {
                throw new Error('Unknown data type "' + dataType + '" of element "' + field.name + '".');
            }
        });
        return data;
    };
})(jQuery);

$.extend($.fn.bootstrapTable.defaults, {
    pagination: true,
    pageSize: 10,
    clickToSelect: true
});