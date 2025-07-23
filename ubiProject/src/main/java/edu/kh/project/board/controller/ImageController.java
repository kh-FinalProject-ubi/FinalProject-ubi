package edu.kh.project.board.controller;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ImageController {

	@GetMapping("/images/board/{filename:.+}")
	public ResponseEntity<Resource> getImage(@PathVariable(name = "filename") String filename) throws IOException {
	    Path path = Paths.get("home/ec2-user/uploadFiles/board/").resolve(filename);
	    Resource resource = new UrlResource(path.toUri());

	    if (!resource.exists()) {
	        return ResponseEntity.notFound().build();
	    }

	    String contentType = Files.probeContentType(path);

	    return ResponseEntity.ok()
	            .contentType(MediaType.parseMediaType(contentType))
	            .body(resource);
	}
}