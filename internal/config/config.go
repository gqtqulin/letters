package config

import (
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	ServerPort  string `envconfig:"SERVER_PORT" default:"8080"`
	DBPath      string `envconfig:"DB_PATH" envDefault:"./db/site.db"`
	TokenSecret string `envconfig:"TOKEN_SECRET" required:"true"`
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return nil, err
	}

	var config Config
	return &config, envconfig.Process("", &config)
}
