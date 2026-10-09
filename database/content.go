package database

import (
	"errors"
	"strings"

	"github.com/mereith/nav/types"
)

func initContentTable() error {
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS nav_content (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			"desc" TEXT,
			format TEXT NOT NULL DEFAULT 'markdown',
			body TEXT,
			sort INTEGER NOT NULL DEFAULT 0,
			hide BOOLEAN NOT NULL DEFAULT 0,
			updatedAt TEXT
		);`)
	return err
}

// 获取内容列表（不含正文）。onlyVisible 为 true 时过滤隐藏项。
func GetAllContents(onlyVisible bool) ([]types.Content, error) {
	sql := `SELECT id, title, IFNULL("desc",''), format, sort, hide, IFNULL(updatedAt,'') FROM nav_content`
	if onlyVisible {
		sql += ` WHERE hide = 0`
	}
	sql += ` ORDER BY sort ASC, id DESC`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []types.Content{}
	for rows.Next() {
		var c types.Content
		if err := rows.Scan(&c.Id, &c.Title, &c.Desc, &c.Format, &c.Sort, &c.Hide, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func GetContent(id int) (types.Content, error) {
	var c types.Content
	err := DB.QueryRow(`SELECT id, title, IFNULL("desc",''), format, IFNULL(body,''), sort, hide, IFNULL(updatedAt,'') FROM nav_content WHERE id = ?`, id).
		Scan(&c.Id, &c.Title, &c.Desc, &c.Format, &c.Body, &c.Sort, &c.Hide, &c.UpdatedAt)
	return c, err
}

func normalizeContent(c *types.Content) error {
	c.Title = strings.TrimSpace(c.Title)
	if c.Title == "" {
		return errors.New("标题不能为空")
	}
	if c.Format != "html" {
		c.Format = "markdown"
	}
	return nil
}

func AddContent(c types.Content) (int64, error) {
	if err := normalizeContent(&c); err != nil {
		return 0, err
	}
	res, err := DB.Exec(`INSERT INTO nav_content (title, "desc", format, body, sort, hide, updatedAt)
		VALUES (?, ?, ?, ?, ?, ?, datetime('now','localtime'))`,
		c.Title, c.Desc, c.Format, c.Body, c.Sort, c.Hide)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func UpdateContent(c types.Content) error {
	if err := normalizeContent(&c); err != nil {
		return err
	}
	_, err := DB.Exec(`UPDATE nav_content SET title=?, "desc"=?, format=?, body=?, sort=?, hide=?, updatedAt=datetime('now','localtime') WHERE id=?`,
		c.Title, c.Desc, c.Format, c.Body, c.Sort, c.Hide, c.Id)
	return err
}

func DeleteContent(id int) error {
	_, err := DB.Exec(`DELETE FROM nav_content WHERE id = ?`, id)
	return err
}

func UpdateContentSort(items []struct {
	Id   int `json:"id"`
	Sort int `json:"sort"`
}) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	for _, it := range items {
		if _, err := tx.Exec(`UPDATE nav_content SET sort = ? WHERE id = ?`, it.Sort, it.Id); err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit()
}
