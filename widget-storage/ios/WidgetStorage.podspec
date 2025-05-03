require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))
podspec_version = package['version']
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name = 'WidgetStorage'
  s.version = podspec_version
  s.summary = package['description']
  s.description = package['description']
  s.license = package['license']
  s.author = package['author']
  s.homepage = package['homepage']
  s.platform = :ios, '13.0'
  s.swift_version = '5.4'
  s.source = { :git => 'https://github.com/your-repo/widget-storage', :tag => s.version }

  s.static_framework = true

  # Set the deployment target for this pod
  s.ios.deployment_target = '13.0'

  # Source files for the pod
  s.source_files = '**/*.{h,m,swift}'

  # Dependencies
  s.dependency 'ExpoModulesCore'

  # Swift Package Manager dependencies
  # Add any Swift packages your module depends on here
  # s.dependency 'SomeSwiftPackage'

  # Use default React Native headers
  s.compiler_flags = folly_compiler_flags + ' -DRN_FABRIC_ENABLED=1'
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'DEFINES_MODULE' => 'YES',
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/Headers/Public/React-Core"'
  }
  s.user_target_xcconfig = { 'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)"' }
  s.requires_arc = true
end 