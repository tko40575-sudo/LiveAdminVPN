package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println(`{"error": "Missing API URL or Key ID"}`)
		return
	}

	apiUrl := strings.TrimSuffix(os.Args[1], "/")
	keyID := os.Args[2]

	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	resp, err := http.Get(apiUrl + "/metrics/transfer")
	if err != nil {
		fmt.Printf(`{"error": "Failed to connect. Check URL."}` + "\n")
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var metrics struct {
		BytesTransferredByUserId map[string]float64 `json:"bytesTransferredByUserId"`
	}
	json.Unmarshal(body, &metrics)

	usedBytes := metrics.BytesTransferredByUserId[keyID]
	usedGB := usedBytes / (1024 * 1024 * 1024)

	result := map[string]interface{}{
		"status":  "success",
		"usedGB":  fmt.Sprintf("%.2f", usedGB),
		"totalGB": "Unlimited",
	}
	jsonOut, _ := json.Marshal(result)
	fmt.Println(string(jsonOut))
}
