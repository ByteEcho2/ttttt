package handler

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mereith/nav/database"
	"github.com/mereith/nav/types"
	"github.com/mereith/nav/utils"
)

func contentErr(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"success": false, "errorMessage": msg})
}

// 公开：获取单条内容正文（隐藏内容仅登录用户可见）
func GetContentHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		contentErr(c, http.StatusBadRequest, "无效的ID")
		return
	}
	content, err := database.GetContent(id)
	if err == sql.ErrNoRows || (err == nil && content.Hide && !utils.IsLogin(c)) {
		contentErr(c, http.StatusNotFound, "内容不存在")
		return
	}
	if err != nil {
		contentErr(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(200, gin.H{"success": true, "data": content})
}

// 管理：列表
func GetAllContentsHandler(c *gin.Context) {
	list, err := database.GetAllContents(false)
	if err != nil {
		contentErr(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(200, gin.H{"success": true, "data": list})
}

func AddContentHandler(c *gin.Context) {
	var data types.Content
	if err := c.ShouldBindJSON(&data); err != nil {
		contentErr(c, http.StatusBadRequest, err.Error())
		return
	}
	id, err := database.AddContent(data)
	if err != nil {
		contentErr(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(200, gin.H{"success": true, "message": "添加内容成功", "data": gin.H{"id": id}})
}

func UpdateContentHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		contentErr(c, http.StatusBadRequest, "无效的ID")
		return
	}
	var data types.Content
	if err := c.ShouldBindJSON(&data); err != nil {
		contentErr(c, http.StatusBadRequest, err.Error())
		return
	}
	data.Id = id
	if err := database.UpdateContent(data); err != nil {
		contentErr(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(200, gin.H{"success": true, "message": "更新内容成功"})
}

func DeleteContentHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		contentErr(c, http.StatusBadRequest, "无效的ID")
		return
	}
	if err := database.DeleteContent(id); err != nil {
		contentErr(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(200, gin.H{"success": true, "message": "删除内容成功"})
}

func UpdateContentSortHandler(c *gin.Context) {
	var items []struct {
		Id   int `json:"id"`
		Sort int `json:"sort"`
	}
	if err := c.ShouldBindJSON(&items); err != nil {
		contentErr(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := database.UpdateContentSort(items); err != nil {
		contentErr(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(200, gin.H{"success": true, "message": "更新排序成功"})
}
