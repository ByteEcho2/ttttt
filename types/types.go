package types

// 默认是 0
type Setting struct {
	Id                   int    `json:"id"`
	Favicon              string `json:"favicon"`
	Title                string `json:"title"`
	GovRecord            string `json:"govRecord"`
	Logo192              string `json:"logo192"`
	Logo512              string `json:"logo512"`
	HideAdmin            bool   `json:"hideAdmin"`
	HideGithub           bool   `json:"hideGithub"`
	HideToggleJumpTarget bool   `json:"hideToggleJumpTarget"`
	JumpTargetBlank      bool   `json:"jumpTargetBlank"`
}

type Token struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Value    string `json:"value"`
	Disabled int    `json:"disabled"`
}

type User struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Password string `json:"password"`
}
type Img struct {
	Id    int    `json:"id"`
	Url   string `json:"url"`
	Value string `json:"value"`
}

type Tool struct {
	Id      int    `json:"id"`
	Name    string `json:"name"`
	Url     string `json:"url"`
	Logo    string `json:"logo"`
	Catelog string `json:"catelog"`
	Desc    string `json:"desc"`
	Sort    int    `json:"sort"`
	Hide    bool   `json:"hide"`
}

type Catelog struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
	Sort int    `json:"sort"`
	Hide bool   `json:"hide"`
}

// 搜索引擎模型
type SearchEngine struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	BaseUrl     string `json:"baseUrl"`
	QueryParam  string `json:"queryParam"`
	Logo        string `json:"logo"`
	Sort        int    `json:"sort"`
	Enabled     bool   `json:"enabled"`
}

// 网站配置模型
type SiteConfig struct {
	Id          int  `json:"id"`
	NoImageMode bool `json:"noImageMode"`
	CompactMode bool `json:"compactMode"`
}

// 内容（公告 / 文档）模型。Format 取值：markdown | html
// 列表接口不返回 Body，点击后再按 id 获取，避免首页数据过大。
type Content struct {
	Id        int    `json:"id"`
	Title     string `json:"title"`
	Desc      string `json:"desc"`
	Format    string `json:"format"`
	Body      string `json:"body,omitempty"`
	Sort      int    `json:"sort"`
	Hide      bool   `json:"hide"`
	UpdatedAt string `json:"updatedAt"`
}
